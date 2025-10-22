import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.companyId);
  }

  @Get('recent-activity')
  async getRecentActivity(@CurrentUser() user: any) {
    return this.dashboardService.getRecentActivity(user.companyId);
  }

  @Get('alerts')
  async getStockAlerts(@CurrentUser() user: any) {
    return this.dashboardService.getStockAlerts(user.companyId);
  }

  @Get('inventory-by-category')
  async getInventoryByCategory(@CurrentUser() user: any) {
    return this.dashboardService.getInventoryByCategory(user.companyId);
  }

  @Get('monthly-movements')
  async getMonthlyMovements(@CurrentUser() user: any) {
    return this.dashboardService.getMonthlyMovements(user.companyId);
  }

  @Get('top-products')
  async getTopProducts(@CurrentUser() user: any) {
    return this.dashboardService.getTopProducts(user.companyId);
  }

  @Get('warehouse-stock')
  async getWarehouseStock(@CurrentUser() user: any) {
    return this.dashboardService.getWarehouseStock(user.companyId);
  }
}
