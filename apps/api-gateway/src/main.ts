import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors();

  // Versioning & Validation
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger OpenAPI Docs
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('DigiTrade API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
