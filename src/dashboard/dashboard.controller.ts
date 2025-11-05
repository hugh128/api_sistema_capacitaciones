import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  /**
   * GET /dashboard
   * Obtiener estadisticas para dashboard
   */
  @Get()
  async obtenerEstadisticasDashboard(
    @Query('id') userId?: string,
  ) {
    const id = userId ? parseInt(userId, 10) : null; 
    return this.dashboardService.obtenerEstadisticasDashboard(id);
  }

}
