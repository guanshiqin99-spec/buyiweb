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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const runtime_validation_1 = require("../../config/runtime-validation");
let HealthService = class HealthService {
    constructor(dataSource, configService) {
        this.dataSource = dataSource;
        this.configService = configService;
    }
    getHealth() {
        return {
            status: 'ok',
            service: this.configService.get('app.name', 'Buyi Dictionary API'),
            environment: process.env.NODE_ENV || 'development',
            timestamp: Date.now(),
        };
    }
    async getReadiness() {
        const readiness = (0, runtime_validation_1.getReadinessReport)(this.configService);
        const checks = {
            database: false,
            mediaConfig: readiness.ok,
        };
        try {
            await this.dataSource.query('SELECT 1 AS ok');
            checks.database = true;
        }
        catch {
            readiness.issues.push('数据库连接不可用');
        }
        if (!checks.database || !checks.mediaConfig) {
            throw new common_1.ServiceUnavailableException({
                status: 'degraded',
                checks,
                issues: readiness.issues,
            });
        }
        return {
            status: 'ready',
            checks,
            timestamp: Date.now(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        config_1.ConfigService])
], HealthService);
//# sourceMappingURL=health.service.js.map