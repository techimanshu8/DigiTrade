import { Controller, Get, Put, Body, Req, Param } from '@nestjs/common';
import { KycService } from './kyc.service';
import { UpdateKycStatusDto } from './dto/kyc.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  @ApiOperation({ summary: 'Get my KYC state' })
  async getMyKycState(@Req() req: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    return this.kycService.getKycState(userId as string);
  }

  // Admin route or internal route to update KYC state
  @Put('status/:userId')
  @ApiOperation({ summary: 'Update user KYC status' })
  async updateKycStatus(
    @Param('userId') targetUserId: string,
    @Body() updateKycDto: UpdateKycStatusDto,
    @Req() req: any
  ) {
    const adminId = req.headers['x-user-id'] || 'system';
    return this.kycService.updateKycStatus(targetUserId, updateKycDto, adminId);
  }
}
