import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { KafkaModule } from './kafka/kafka.module';
import { S3Module } from './s3/s3.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    KafkaModule,
    S3Module,
    DocumentModule,
  ],
})
export class AppModule {}
