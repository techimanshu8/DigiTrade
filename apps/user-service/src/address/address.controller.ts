import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { AddressService } from './address.service';
import { UpsertAddressDto } from './dto/address.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get my address' })
  async getAddress(@Req() req: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    return this.addressService.getAddress(userId as string);
  }

  @Put()
  @ApiOperation({ summary: 'Update or create my address' })
  async upsertAddress(@Req() req: any, @Body() upsertAddressDto: UpsertAddressDto) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    return this.addressService.upsertAddress(userId as string, upsertAddressDto);
  }
}
