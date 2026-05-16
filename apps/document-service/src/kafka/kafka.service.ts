import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaService.name);

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'document-service',
      brokers: [this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected successfully.');
    } catch (err) {
      this.logger.error('Failed to connect to Kafka Producer', err);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emit(topic: string, event: string, payload: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event,
            value: JSON.stringify(payload),
          },
        ],
      });
      this.logger.log(`Event ${event} published to topic ${topic}`);
    } catch (err) {
      this.logger.error(`Failed to publish event ${event} to topic ${topic}`, err);
    }
  }
}
