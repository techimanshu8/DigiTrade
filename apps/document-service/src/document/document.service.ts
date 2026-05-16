import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { KafkaService } from '../kafka/kafka.service';
import { UploadDocumentDto } from './dto/document.dto';
import { DocumentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private kafkaService: KafkaService,
  ) {}

  async uploadDocument(userId: string, file: Express.Multer.File, dto: UploadDocumentDto) {
    const id = uuidv4();
    const fileExt = file.originalname.split('.').pop();
    const s3Key = `users/${userId}/documents/${dto.type}/${id}.${fileExt}`;

    // 1. Upload to S3
    const bucket = await this.s3Service.uploadFile(s3Key, file.buffer, file.mimetype);

    // 2. Save Metadata to Prisma
    const document = await this.prisma.document.create({
      data: {
        id,
        userId,
        type: dto.type,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        s3Key,
        s3Bucket: bucket,
        metadata: dto.metadata || {},
        status: DocumentStatus.PENDING,
      },
    });

    // 3. Trigger Virus Scan Event
    // In a real system, an external service like ClamAV reads this event, scans the S3 object
    // and hits the webhook.
    await this.kafkaService.emit('document.events', 'DOCUMENT_UPLOADED', {
      documentId: id,
      userId,
      s3Key,
      s3Bucket: bucket,
    });

    return document;
  }

  async handleVirusScanResult(id: string, status: 'CLEAN' | 'INFECTED') {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    if (status === 'INFECTED') {
      await this.prisma.document.update({
        where: { id },
        data: { status: DocumentStatus.VIRUS_SCAN_FAILED },
      });
      // Optionally delete the file from S3 to prevent leaks
      await this.s3Service.deleteFile(doc.s3Key, doc.s3Bucket);
      this.logger.warn(`Document ${id} failed virus scan and was quarantined/deleted.`);
      return { status: 'Quarantined' };
    }

    // If Clean, update status and check if OCR is needed
    const updatedDoc = await this.prisma.document.update({
      where: { id },
      data: { status: DocumentStatus.OCR_PROCESSING },
    });

    // 4. Trigger OCR Event for specific document types (e.g. PAN, PASSPORT, INVOICE)
    const ocrEligibleTypes = ['PAN', 'PASSPORT', 'VISA', 'INVOICE', 'BOE'];
    if (ocrEligibleTypes.includes(updatedDoc.type)) {
      await this.kafkaService.emit('document.ocr', 'OCR_JOB_REQUESTED', {
        documentId: updatedDoc.id,
        userId: updatedDoc.userId,
        type: updatedDoc.type,
        s3Key: updatedDoc.s3Key,
      });
      this.logger.log(`OCR Job requested for document ${id}`);
    } else {
      // Fast-track to verification step if OCR is not needed
      await this.prisma.document.update({
        where: { id },
        data: { status: DocumentStatus.VERIFIED },
      });
    }

    return updatedDoc;
  }

  async getDocumentsByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getPresignedUrl(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException('Document not found');
    }

    const url = await this.s3Service.generatePresignedUrl(doc.s3Key, doc.s3Bucket);
    return { url };
  }

  async deleteDocument(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException('Document not found');
    }

    // 1. Delete from S3
    try {
      await this.s3Service.deleteFile(doc.s3Key, doc.s3Bucket);
    } catch (e) {
      this.logger.error(`Failed to delete S3 object for document ${id}`, e);
    }

    // 2. Delete metadata
    await this.prisma.document.delete({ where: { id } });
  }
}
