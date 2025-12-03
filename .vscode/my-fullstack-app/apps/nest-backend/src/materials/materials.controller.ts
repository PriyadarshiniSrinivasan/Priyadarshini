import { Controller, Get, Post, Put, Query, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger'
import { MaterialsService } from './materials.service'
import { OktaJwtGuard } from '../auth/okta-jwt.guard'

@ApiTags('Materials')
@ApiBearerAuth('JWT-auth')
@Controller('materials')
@UseGuards(OktaJwtGuard)
export class MaterialsController {
  constructor(private svc: MaterialsService) {}
  
  @Get()
  @ApiOperation({ 
    summary: 'Search and List Materials',
    description: 'Retrieve a list of materials with optional filtering by department, category, and name'
  })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department', example: 'Engineering' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', example: 'Electronics' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by material name', example: 'Resistor' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of materials retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Resistor 100k' },
          department: { type: 'string', example: 'Engineering' },
          category: { type: 'string', example: 'Electronics' },
          quantity: { type: 'number', example: 500 }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  list(@Query('department') department?: string, @Query('category') category?: string, @Query('name') name?: string) {
    return this.svc.search({ department, category, name })
  }
  
  @Post()
  @ApiOperation({ 
    summary: 'Create New Material',
    description: 'Add a new material to the database'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Material name', example: 'Resistor 100k' },
        department: { type: 'string', description: 'Department', example: 'Engineering' },
        category: { type: 'string', description: 'Category', example: 'Electronics' },
        quantity: { type: 'number', description: 'Quantity', example: 500 },
        description: { type: 'string', description: 'Material description', example: 'High precision 100k ohm resistor' }
      },
      required: ['name', 'department']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Material created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Resistor 100k' },
        department: { type: 'string', example: 'Engineering' },
        category: { type: 'string', example: 'Electronics' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  create(@Body() body: any) { return this.svc.create(body) }
  
  @Put(':id')
  @ApiOperation({ 
    summary: 'Update Material',
    description: 'Update an existing material by ID'
  })
  @ApiParam({ name: 'id', description: 'Material ID', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Material name', example: 'Resistor 100k' },
        department: { type: 'string', description: 'Department', example: 'Engineering' },
        category: { type: 'string', description: 'Category', example: 'Electronics' },
        quantity: { type: 'number', description: 'Quantity', example: 500 },
        description: { type: 'string', description: 'Material description', example: 'Updated description' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Material updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Resistor 100k' },
        department: { type: 'string', example: 'Engineering' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(Number(id), body) }
}
