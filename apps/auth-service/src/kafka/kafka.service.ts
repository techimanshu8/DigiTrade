import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Admin } from 'kafkajs';

export interface AuthEvent {
  id: string;
  eventType: string;
  userId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const brokers = this.configService.get('KAFKA_BROKERS', 'localhost:9092').split(',');

    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID', 'auth-service'),
      brokers,
      retry: {
        retries: 8,
        initialRetryTime: 100,
        factor: 2,
      },
    });

    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      await this.admin.connect();
      this.isConnected = true;
      this.logger.log('Kafka producer and admin connected');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.producer.disconnect();
      await this.admin.disconnect();
      this.logger.log('Kafka producer and admin disconnected');
    }
  }

  async publishEvent(topic: string, event: AuthEvent) {
    if (!this.isConnected) {
      this.logger.warn('Kafka not connected, skipping event publish');
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.userId || 'system',
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.debug(`Event published to topic ${topic}: ${event.eventType}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}`, error);
      throw error;
    }
  }

  async publishUserSignUpEvent(userId: string, email: string, fullName: string) {
    await this.publishEvent('user.signup', {
      id: `signup-${userId}`,
      eventType: 'USER_SIGNED_UP',
      userId,
      data: {
        email,
        fullName,
      },
      timestamp: new Date(),
    });
  }

  async publishUserLoginEvent(userId: string, ipAddress?: string) {
    await this.publishEvent('user.login', {
      id: `login-${userId}`,
      eventType: 'USER_LOGGED_IN',
      userId,
      data: {
        ipAddress,
      },
      timestamp: new Date(),
    });
  }

  async publishPasswordResetRequestedEvent(userId: string, email: string) {
    await this.publishEvent('user.password-reset-requested', {
      id: `password-reset-${userId}`,
      eventType: 'PASSWORD_RESET_REQUESTED',
      userId,
      data: {
        email,
      },
      timestamp: new Date(),
    });
  }

  async publishPasswordResetCompletedEvent(userId: string, email: string) {
    await this.publishEvent('user.password-reset-completed', {
      id: `password-reset-completed-${userId}`,
      eventType: 'PASSWORD_RESET_COMPLETED',
      userId,
      data: {
        email,
      },
      timestamp: new Date(),
    });
  }
}
