// src/app.controller.ts
import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller() // Root controller -> routes without prefix (e.g., '/', '/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /
  @Get()
  getHello() {
    // Simple landing response to verify the API is alive
    return this.appService.getHello()
  }

  // GET /health
  @Get('health')
  getHealth() {
    // Minimal health-check information
    return {
      status: 'ok',
      uptime: process.uptime(), // seconds
      timestamp: new Date().toISOString(),
    }
  }
}
