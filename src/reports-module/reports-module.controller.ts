import { 
  Controller, 
  Get, 
  Query, 
  Res, 
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsModuleService } from './reports-module.service';
import { ReporteFiltrosDto } from './dto/reporte-filtros.dto';

@Controller('reports-module')
export class ReportsModuleController {
  constructor(private readonly reportsModuleService: ReportsModuleService) {}

  @Get('dashboard')
  obtenerDashboardEjecutvo() {
    return this.reportsModuleService.obtenerDashboardEjecutvo();
  }

  /**
   * Obtener datos JSON de detalle de capacitaciones
   */
  @Get('detalle-capacitaciones')
  obtenerDetalleCapacitacionesColaboradores(@Query() filtros: ReporteFiltrosDto) {
    return this.reportsModuleService.obtenerDetalleCapacitacionesColaboradores(filtros);
  }

  /**
   * Descargar reporte Excel de detalle de capacitaciones
   */
  @Get('detalle-capacitaciones/excel')
  async descargarExcelDetalleCapacitaciones(
    @Query() filtros: ReporteFiltrosDto,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsModuleService.generarExcelDetalleCapacitaciones(filtros);

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const rangoFechas = filtros.fechaInicio && filtros.fechaFin 
        ? `_${filtros.fechaInicio}_${filtros.fechaFin}`
        : '';
      const fileName = `Detalle_Capacitaciones${rangoFechas}_${fecha}.xlsx`;

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length,
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte',
        error: error.message,
      });
    }
  }

  /**
   * Obtener datos JSON de cumplimiento de colaboradores
   */
  @Get('cumplimiento-colaboradores')
  obtenerDetalleCumplimientoColaboradores() {
    return this.reportsModuleService.obtenerDetalleCumplimientoColaboradores();
  }

  /**
   * Descargar reporte Excel de cumplimiento de colaboradores
   */
  @Get('cumplimiento-colaboradores/excel')
  async descargarExcelCumplimientoColaboradores(@Res() res: Response) {
    try {
      const buffer = await this.reportsModuleService.generarExcelCumplimientoColaboradores();

      const fecha = new Date().toISOString().split('T')[0];
      const fileName = `Cumplimiento_Colaboradores_${fecha}.xlsx`;

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length,
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte',
        error: error.message,
      });
    }
  }
}
