import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Next } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // CORS Configuration
  app.enableCors({
    origin: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  })

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Biodata Manager API')
    .setDescription('API documentation for Biodata Manager - A comprehensive system for managing materials, tables, files, and folders')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth() decorator
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Materials', 'Material management operations')
    .addTag('Tables', 'Table data operations')
    .addTag('Files', 'File upload and management')
    .addTag('Folders', 'Folder hierarchy management')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Biodata Manager API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  })

  await app.listen(3000)
  console.log(`Application is running on: http://localhost:3000`)
  console.log(`Swagger documentation available at: http://localhost:3000/api`)
}
bootstrap()

