import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user';
import type { User } from '@supabase/supabase-js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    return this.dashboardService.getSummary(user.id, date);
  }
}
