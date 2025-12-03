import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger'
import { TablesService } from './tables.service'
import { OktaJwtGuard } from '../auth/okta-jwt.guard'

@ApiTags('Tables')
@ApiBearerAuth('JWT-auth')
@Controller('tables')
@UseGuards(OktaJwtGuard)
export class TablesController {
  constructor(private svc: TablesService) {}
  
  @Get()
  @ApiOperation({ 
    summary: 'List All Tables',
    description: 'Retrieve a list of all available database tables'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of tables retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'users' },
          schema: { type: 'string', example: 'public' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  list() { return this.svc.listTables() }
  
  @Get(':table/columns')
  @ApiOperation({ 
    summary: 'Get Table Columns',
    description: 'Retrieve column definitions for a specific table'
  })
  @ApiParam({ name: 'table', description: 'Table name', example: 'users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Table columns retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'id' },
          type: { type: 'string', example: 'integer' },
          nullable: { type: 'boolean', example: false },
          default: { type: 'string', example: 'nextval(\'users_id_seq\')' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  columns(@Param('table') table: string) { return this.svc.getColumns(table) }
  
  @Get(':table/rows')
  @ApiOperation({ 
    summary: 'Get Table Rows',
    description: 'Retrieve all rows from a specific table'
  })
  @ApiParam({ name: 'table', description: 'Table name', example: 'users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Table rows retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true,
        example: { id: 1, name: 'John Doe', email: 'john@example.com' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  rows(@Param('table') table: string) { return this.svc.getRows(table) }
  
  @Post(':table/rows')
  @ApiOperation({ 
    summary: 'Insert Row',
    description: 'Insert a new row into a specific table'
  })
  @ApiParam({ name: 'table', description: 'Table name', example: 'users' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        values: {
          type: 'object',
          additionalProperties: true,
          description: 'Column-value pairs for the new row',
          example: { name: 'John Doe', email: 'john@example.com', age: 30 }
        }
      },
      required: ['values']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Row inserted successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  insert(@Param('table') table: string, @Body() body: { values: Record<string,any> }) {
    return this.svc.insertRow(table, body.values).then(()=>({ok:true}))
  }
  
  @Put(':table/rows')
  @ApiOperation({ 
    summary: 'Update Row',
    description: 'Update an existing row in a specific table'
  })
  @ApiParam({ name: 'table', description: 'Table name', example: 'users' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        original: {
          type: 'object',
          additionalProperties: true,
          description: 'Original row data to match for update',
          example: { id: 1 }
        },
        values: {
          type: 'object',
          additionalProperties: true,
          description: 'New values to update',
          example: { name: 'Jane Doe', email: 'jane@example.com' }
        }
      },
      required: ['original', 'values']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Row updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Table or row not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  update(@Param('table') table: string, @Body() body: { original: any; values: any }) {
    return this.svc.updateRow(table, body.original, body.values).then(()=>({ok:true}))
  }
  
  @Post()
  @ApiOperation({ 
    summary: 'Create New Table',
    description: 'Create a new database table with specified columns'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the new table',
          example: 'products'
        },
        columns: {
          type: 'array',
          description: 'Column definitions',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'id' },
              type: { type: 'string', example: 'integer' },
              nullable: { type: 'boolean', example: false }
            },
            required: ['name', 'type', 'nullable']
          },
          example: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'name', type: 'varchar', nullable: false },
            { name: 'price', type: 'decimal', nullable: true }
          ]
        }
      },
      required: ['tableName', 'columns']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Table created successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid table definition' })
  @ApiResponse({ status: 409, description: 'Conflict - Table already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  create(@Body() body: { tableName: string; columns: { name: string; type: string; nullable: boolean }[] }) {
    return this.svc.createTable(body.tableName, body.columns).then(()=>({ok:true}))
  }
}

