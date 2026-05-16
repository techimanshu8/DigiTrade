import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'ap-south-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
      },
      // for local dev testing with minio/localstack
      endpoint: this.configService.get<string>('AWS_S3_ENDPOINT'),
      forcePathStyle: true,
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'digitrade-docs-local';
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });
    
    await this.s3Client.send(command);
    return this.bucket;
  }

  async generatePresignedUrl(key: string, bucket: string = this.bucket): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    // URL expires in 1 hour (3600 seconds)
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string, bucket: string = this.bucket): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }
}
