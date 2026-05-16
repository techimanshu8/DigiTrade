import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RedisModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRE_IN', '7d') },
      }),
    }),
  ],
  providers: [QuoteService],
  controllers: [QuoteController],
})
export class QuoteModule {}
