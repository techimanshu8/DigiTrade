// src/kafka/kafka.producer.ts
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, CompressionTypes, RecordMetadata } from 'kafkajs';

export interface KafkaMessage<T = unknown> {
  key?: string;
  value: T;
  headers?: Record<string, string>;
}

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const kafka = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId'),
      brokers: this.configService.get<string[]>('kafka.brokers')!,
      ssl: this.configService.get<boolean>('kafka.ssl'),
      sasl: this.configService.get('kafka.sasl'),
      retry: { retries: 5, initialRetryTime: 300 },
    });

    this.producer = kafka.producer({
      idempotent: true,
      maxInFlightRequests: 1,
      transactionTimeout: 30000,
    });

    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emit<T>(topic: string, message: KafkaMessage<T>): Promise<RecordMetadata[]> {
    const { key, value, headers } = message;
    return this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: key ?? null,
          value: JSON.stringify(value),
          headers: {
            'content-type': 'application/json',
            source: 'auth-service',
            timestamp: Date.now().toString(),
            ...headers,
          },
        },
      ],
    });
  }
}

// src/kafka/kafka.module.ts
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [KafkaProducer],
  exports: [KafkaProducer],
})
export class KafkaModule {}
