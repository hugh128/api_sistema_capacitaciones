import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class DashboardService {

  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  /**
   * Obtener stats para dashboard
   */
  async obtenerEstadisticasDashboard(id: number | null) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_CAPACITADOR', id)
        .execute('SP_OBTENER_DASHBOARD_COMPLETO');
      
      return {
        ESTADISTICAS: result.recordsets[0]?.[0] || null,
        CAPACITACIONES_RECIENTES: result.recordsets[1] || [],
        ACTIVIDADES_PROXIMAS: result.recordsets[2] || [],
      };

    } catch (error) {
      this.logger.error('Error al obtener estadisticas', error);
      this.databaseErrorService.handle(error);
    }
  }

}
