"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tables_service_1 = require("./tables.service");
const okta_jwt_guard_1 = require("../auth/okta-jwt.guard");
let TablesController = class TablesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    list() { return this.svc.listTables(); }
    columns(table) { return this.svc.getColumns(table); }
    rows(table) { return this.svc.getRows(table); }
    insert(table, body) {
        return this.svc.insertRow(table, body.values).then(() => ({ ok: true }));
    }
    update(table, body) {
        return this.svc.updateRow(table, body.original, body.values).then(() => ({ ok: true }));
    }
    create(body) {
        return this.svc.createTable(body.tableName, body.columns).then(() => ({ ok: true }));
    }
};
exports.TablesController = TablesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List All Tables',
        description: 'Retrieve a list of all available database tables'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':table/columns'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Table Columns',
        description: 'Retrieve column definitions for a specific table'
    }),
    (0, swagger_1.ApiParam)({ name: 'table', description: 'Table name', example: 'users' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Table not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('table')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "columns", null);
__decorate([
    (0, common_1.Get)(':table/rows'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Table Rows',
        description: 'Retrieve all rows from a specific table'
    }),
    (0, swagger_1.ApiParam)({ name: 'table', description: 'Table name', example: 'users' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Table not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('table')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "rows", null);
__decorate([
    (0, common_1.Post)(':table/rows'),
    (0, swagger_1.ApiOperation)({
        summary: 'Insert Row',
        description: 'Insert a new row into a specific table'
    }),
    (0, swagger_1.ApiParam)({ name: 'table', description: 'Table name', example: 'users' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Row inserted successfully',
        schema: {
            type: 'object',
            properties: {
                ok: { type: 'boolean', example: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Table not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('table')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "insert", null);
__decorate([
    (0, common_1.Put)(':table/rows'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update Row',
        description: 'Update an existing row in a specific table'
    }),
    (0, swagger_1.ApiParam)({ name: 'table', description: 'Table name', example: 'users' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Row updated successfully',
        schema: {
            type: 'object',
            properties: {
                ok: { type: 'boolean', example: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Table or row not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('table')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create New Table',
        description: 'Create a new database table with specified columns'
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Table created successfully',
        schema: {
            type: 'object',
            properties: {
                ok: { type: 'boolean', example: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid table definition' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflict - Table already exists' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "create", null);
exports.TablesController = TablesController = __decorate([
    (0, swagger_1.ApiTags)('Tables'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('tables'),
    (0, common_1.UseGuards)(okta_jwt_guard_1.OktaJwtGuard),
    __metadata("design:paramtypes", [tables_service_1.TablesService])
], TablesController);
//# sourceMappingURL=tables.controller.js.map