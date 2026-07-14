import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { getReadinessReport } from '../../config/runtime-validation';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: this.configService.get<string>('app.name', 'Buyi Dictionary API'),
      environment: process.env.NODE_ENV || 'development',
      timestamp: Date.now(),
    };
  }

  async getReadiness() {
    const readiness = getReadinessReport(this.configService);
    const checks = {
      database: false,
      mediaConfig: readiness.ok,
    };

    try {
      await this.dataSource.query('SELECT 1 AS ok');
      checks.database = true;
    } catch {
      readiness.issues.push('数据库连接不可用');
    }

    if (!checks.database || !checks.mediaConfig) {
      throw new ServiceUnavailableException({
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
}
