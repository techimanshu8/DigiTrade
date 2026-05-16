"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Security
    app.use((0, helmet_1.default)());
    app.enableCors();
    // Versioning & Validation
    app.enableVersioning({
        type: common_1.VersioningType.URI,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    // Global Interceptors
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    // Swagger OpenAPI Docs
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API Gateway')
        .setDescription('DigiTrade API Gateway')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.API_GATEWAY_PORT || 3000;
    await app.listen(port);
    console.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map