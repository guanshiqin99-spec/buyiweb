import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AdminJwtGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  summary() {
    return this.adminDashboardService.getSummary();
  }

  @Post('batch-publish')
  batchPublish() {
    return this.adminDashboardService.batchPublishAll();
  }
}
