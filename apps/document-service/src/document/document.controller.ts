import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Req, Body, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { UploadDocumentDto, WebhookScanResultDto } from './dto/document.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
        },
        metadata: {
          type: 'object'
        }
      },
    },
  })
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID not found in headers');
    }
    
    // Parse fields properly from formdata
    const uploadDto: UploadDocumentDto = {
      type: body.type,
    };
    if (body.metadata) {
      try {
        uploadDto.metadata = typeof body.metadata === 'string' ? JSON.parse(body.metadata) : body.metadata;
      } catch (e) {
        // ignore
      }
    }

    if (!file) {
      throw new Error('No file provided');
    }

    return this.documentService.uploadDocument(userId as string, file, uploadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my documents' })
  async getMyDocuments(@Req() req: any) {
    const userId = req.headers['x-user-id'];
    return this.documentService.getDocumentsByUser(userId as string);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Generate a presigned URL to view/download a document' })
  async getDocumentUrl(@Req() req: any, @Param('id') id: string) {
    const userId = req.headers['x-user-id'];
    return this.documentService.getPresignedUrl(userId as string, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Req() req: any, @Param('id') id: string) {
    const userId = req.headers['x-user-id'];
    await this.documentService.deleteDocument(userId as string, id);
    return { success: true };
  }

  @Post(':id/scan-hook')
  @ApiOperation({ summary: 'Internal webhook for virus scan completion' })
  async handleScanHook(@Param('id') id: string, @Body() payload: WebhookScanResultDto) {
    return this.documentService.handleVirusScanResult(id, payload.status);
  }
}
