import { Controller, Get, Post, Body, Param, Put, Delete, Req } from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Beneficiaries')
@ApiBearerAuth()
@Controller('beneficiaries')
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new beneficiary' })
  create(@Req() req: any, @Body() createBeneficiaryDto: CreateBeneficiaryDto) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    return this.beneficiaryService.create(userId as string, createBeneficiaryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all my beneficiaries' })
  findAll(@Req() req: any) {
    const userId = req.headers['x-user-id'];
    return this.beneficiaryService.findAll(userId as string);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific beneficiary' })
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.headers['x-user-id'];
    return this.beneficiaryService.findOne(userId as string, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a beneficiary' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    const userId = req.headers['x-user-id'];
    return this.beneficiaryService.update(userId as string, id, updateBeneficiaryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a beneficiary (soft delete)' })
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.headers['x-user-id'];
    return this.beneficiaryService.remove(userId as string, id);
  }
}
