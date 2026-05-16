import { Controller, Get, Post, Body, Req, UseGuards, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get my profile' })
  async getProfile(@Req() req: any) {
    const userId = req.headers['x-user-id']; // Provided by Gateway
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    return this.profileService.getProfile(userId as string);
  }

  @Put()
  @ApiOperation({ summary: 'Update or create my profile' })
  async upsertProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    return this.profileService.upsertProfile(userId as string, updateProfileDto);
  }
}
