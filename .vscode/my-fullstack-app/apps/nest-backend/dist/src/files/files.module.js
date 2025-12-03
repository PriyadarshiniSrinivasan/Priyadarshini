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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_controller_1 = require("./files.controller");
const files_service_1 = require("./files.service");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
let FilesModule = class FilesModule {
    constructor() {
        this.createUploadsDirectory();
    }
    async createUploadsDirectory() {
        const uploadsDir = './uploads';
        if (!(0, fs_1.existsSync)(uploadsDir)) {
            try {
                await (0, promises_1.mkdir)(uploadsDir, { recursive: true });
                console.log('📁 Created uploads directory');
            }
            catch (error) {
                console.error('❌ Error creating uploads directory:', error);
            }
        }
    }
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            platform_express_1.MulterModule.register({
                dest: './uploads',
            }),
        ],
        controllers: [files_controller_1.FilesController],
        providers: [files_service_1.FilesService],
        exports: [files_service_1.FilesService],
    }),
    __metadata("design:paramtypes", [])
], FilesModule);
//# sourceMappingURL=files.module.js.map