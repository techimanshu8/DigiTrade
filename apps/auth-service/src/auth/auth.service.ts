import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { KafkaService } from '../kafka/kafka.service';
import { SignUpDto, SignInDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtPayload } from '@remit/shared-types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDurationMs = 15 * 60 * 1000; // 15 minutes

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private kafkaService: KafkaService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    const { email, password, fullName, mobile } = signUpDto;

    // Check if user already exists
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email }, { mobile: mobile || undefined }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or mobile already registered');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Generate email verification token
    const emailVerificationToken = uuidv4();

    // Create user
    const user = await this.prismaService.user.create({
      data: {
        fullName,
        email,
        mobile,
        passwordHash,
        emailVerificationToken,
      },
    });

    // Send verification email
    try {
      const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${emailVerificationToken}`;
      await this.emailService.sendEmailVerificationEmail(email, verificationUrl);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      // Don't throw, continue with signup
    }

    // Publish signup event to Kafka
    try {
      await this.kafkaService.publishUserSignUpEvent(user.id, email, fullName);
    } catch (error) {
      this.logger.error('Failed to publish signup event', error);
      // Don't throw, continue
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async signIn(signInDto: SignInDto, ipAddress?: string): Promise<AuthResponse> {
    const { email, password } = signInDto;

    // Find user by email
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${minutesRemaining} minutes`,
      );
    }

    // Verify password
    try {
      const isPasswordValid = await argon2.verify(user.passwordHash, password);

      if (!isPasswordValid) {
        // Increment failed login count
        const failedCount = user.failedLoginCount + 1;
        const lockedUntil =
          failedCount >= this.maxFailedAttempts
            ? new Date(Date.now() + this.lockoutDurationMs)
            : null;

        await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failedCount,
            lockedUntil,
          },
        });

        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Authentication failed');
    }

    // Check user status
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Account is inactive. Please verify your email');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is suspended');
    }

    // Reset failed login count on successful login
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Publish login event
    try {
      await this.kafkaService.publishUserLoginEvent(user.id, ipAddress);
    } catch (error) {
      this.logger.error('Failed to publish login event', error);
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked or expired
    const storedToken = await this.prismaService.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Get user
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const { accessToken: newAccessToken, expiresIn } = await this.generateTokens(user.id);

    return {
      accessToken: newAccessToken,
      expiresIn,
    };
  }

  async logout(refreshToken: string) {
    // Revoke refresh token
    await this.prismaService.refreshToken.update({
      where: { token: refreshToken },
      data: {
        revokedAt: new Date(),
      },
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return { message: 'If the email exists, a password reset link will be sent' };
    }

    // Generate password reset token
    const passwordResetToken = uuidv4();
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpiresAt,
      },
    });

    // Send password reset email
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${passwordResetToken}`;
      await this.emailService.sendPasswordResetEmail(email, passwordResetToken, resetUrl);

      // Publish event
      await this.kafkaService.publishPasswordResetRequestedEvent(user.id, email);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }

    return { message: 'If the email exists, a password reset link will be sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Find user with valid reset token
    const user = await this.prismaService.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await argon2.hash(password);

    // Update password and clear reset token
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    // Publish event
    try {
      await this.kafkaService.publishPasswordResetCompletedEvent(user.id, user.email);
    } catch (error) {
      this.logger.error('Failed to publish password reset event', error);
    }

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.prismaService.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // Mark email as verified and activate account
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        status: 'ACTIVE',
      },
    });

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.fullName);
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }

    return { message: 'Email verified successfully' };
  }

  private async generateTokens(userId: string) {
    const payload: JwtPayload = {
      sub: userId,
      email: '',
      role: '',
      permissions: [],
      iat: Math.floor(Date.now() / 1000),
      exp: 0, // Will be set by JWT module
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get('JWT_EXPIRE_IN', '7d');

    // Generate refresh token
    const refreshTokenString = uuidv4();
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prismaService.refreshToken.create({
      data: {
        userId,
        token: refreshTokenString,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn,
    };
  }

  async getMe(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        mobile: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
