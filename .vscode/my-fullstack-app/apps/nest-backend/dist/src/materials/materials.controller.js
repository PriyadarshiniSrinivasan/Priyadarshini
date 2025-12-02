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
exports.MaterialsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const materials_service_1 = require("./materials.service");
const okta_jwt_guard_1 = require("../auth/okta-jwt.guard");
let MaterialsController = class MaterialsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    list(department, category, name) {
        return this.svc.search({ department, category, name });
    }
    create(body) { return this.svc.create(body); }
    update(id, body) { return this.svc.update(Number(id), body); }
};
exports.MaterialsController = MaterialsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Search and List Materials',
        description: 'Retrieve a list of materials with optional filtering by department, category, and name'
    }),
    (0, swagger_1.ApiQuery)({ name: 'department', required: false, description: 'Filter by department', example: 'Engineering' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category', example: 'Electronics' }),
    (0, swagger_1.ApiQuery)({ name: 'name', required: false, description: 'Filter by material name', example: 'Resistor' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Query)('department')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create New Material',
        description: 'Add a new material to the database'
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update Material',
        description: 'Update an existing material by ID'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Material ID', example: 1 }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Material not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "update", null);
exports.MaterialsController = MaterialsController = __decorate([
    (0, swagger_1.ApiTags)('Materials'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('materials'),
    (0, common_1.UseGuards)(okta_jwt_guard_1.OktaJwtGuard),
    __metadata("design:paramtypes", [materials_service_1.MaterialsService])
], MaterialsController);
//# sourceMappingURL=materials.controller.js.map