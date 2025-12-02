import { Injectable } from '@nestjs/common';
import { ReporteFiltrosDto } from './dto/reporte-filtros.dto';
import { DataSource, EntityManager } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { ExcelGeneratorService } from './services/excel-generator.service';
import { DetalleCapacitacion } from './interfaces/detalle-capacitacion.interface';
import { CumplimientoColaborador } from './interfaces/cumplimiento-colaborador.interface';

@Injectable()
export class ReportsModuleService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
    private readonly excelGeneratorService: ExcelGeneratorService,
  ) {}

  /**
   * Obtener dashboard para modulo de reportes
   */
  async obtenerDashboardEjecutvo() {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .execute('SP_REPORTE_DASHBOARD_EJECUTIVO');
      
      return {
        RESUMEN_GENERAL: result.recordsets[0]?.[0] || null,
        CUMPLIMIENTO_POR_PLAN: result.recordsets[1] || [],
        CUMPLIMIENTO_POR_PROGRAMA: result.recordsets[2] || [],
        TOP_DEPARTAMENTOS: result.recordsets[3] || [],
        TOP_CAPACITACIONES: result.recordsets[4] || [],
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener detalle de las capacitaciones de los colaboradores
   */
  async obtenerDetalleCapacitacionesColaboradores(
    filtros?: ReporteFiltrosDto,
  ): Promise<DetalleCapacitacion[]> {
    try {
      let query = 'EXEC SP_REPORTE_DETALLE_CAPACITACIONES_COLABORADOR';
      const params: string[] = [];

      if (filtros?.fechaInicio) {
        params.push(`@FECHA_INICIO = '${filtros.fechaInicio}'`);
      }

      if (filtros?.fechaFin) {
        params.push(`@FECHA_FIN = '${filtros.fechaFin}'`);
      }

      if (params.length > 0) {
        query += ` ${params.join(', ')}`;
      }

      const result = await this.entityManager.query(query);
      return result;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener detalle de cumplimiento de capacitaciones de colaboradores
   */
  async obtenerDetalleCumplimientoColaboradores(): Promise<CumplimientoColaborador[]> {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_REPORTE_CUMPLIMIENTO_COLABORADORES`,
      );

      return result;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Generar reporte Excel de detalle de capacitaciones
   */
  async generarExcelDetalleCapacitaciones(
    filtros?: ReporteFiltrosDto,
  ): Promise<Buffer> {
    try {
      const datos = await this.obtenerDetalleCapacitacionesColaboradores(filtros);
      
      if (!datos || datos.length === 0) {
        throw new Error('No hay datos disponibles para generar el reporte');
      }

      return await this.excelGeneratorService.generarReporteDetalleCapacitaciones(
        datos,
        filtros,
      );
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Generar reporte Excel de cumplimiento de colaboradores
   */
  async generarExcelCumplimientoColaboradores(): Promise<Buffer> {
    try {
      const datos = await this.obtenerDetalleCumplimientoColaboradores();
      
      if (!datos || datos.length === 0) {
        throw new Error('No hay datos disponibles para generar el reporte');
      }

      return await this.excelGeneratorService.generarReporteCumplimientoColaboradores(datos);
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}
