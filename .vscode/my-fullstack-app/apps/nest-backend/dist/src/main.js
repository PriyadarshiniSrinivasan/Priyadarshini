"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Biodata Manager API')
        .setDescription('API documentation for Biodata Manager - A comprehensive system for managing materials, tables, files, and folders')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Authentication', 'User authentication and authorization endpoints')
        .addTag('Materials', 'Material management operations')
        .addTag('Tables', 'Table data operations')
        .addTag('Files', 'File upload and management')
        .addTag('Folders', 'Folder hierarchy management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'Biodata Manager API Docs',
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    await app.listen(3000);
    console.log(`Application is running on: http://localhost:3000`);
    console.log(`Swagger documentation available at: http://localhost:3000/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map