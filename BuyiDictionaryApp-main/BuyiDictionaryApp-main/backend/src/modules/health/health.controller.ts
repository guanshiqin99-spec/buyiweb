import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return this.healthService.getHealth();
  }

  @Public()
  @Get('ready')
  async getReady() {
    return this.healthService.getReadiness();
  }
}
