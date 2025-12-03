// src/app.service.ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello() {
    return {
      app: 'NestJS API for Data Console',
      message: 'Welcome! API is running.',
      docs: {
        health: '/health',
        login: 'POST /auth/login',
        materials: 'GET /materials?department=&category=&name=',
        tables: 'GET /tables',
      },
    }
  }
}