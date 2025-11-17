import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(
    private readonly colaboradoresService: ColaboradoresService
  ) {}

  /**
   * GET /colaboradores
   * Obtiener listado de colaboradores
   */
  @Get()
  async obtenerColaboradores(
    @Query('idEncargado', new ParseIntPipe({ optional: true })) idEncargado?: number
  ) {
    return this.colaboradoresService.obtenerColaboradores(idEncargado ?? null);
  }

  /**
   * GET /colaboradores/:id/capacitaciones
   * Obtiener listado de colaboradores
   */
  @Get(':id/capacitaciones')
  async obtenerCapacitacionesColaborador(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.obtenerCapacitacionesColaborador(id);
  } 

  /**
   * GET /colaboradores/:id/documentos
   * Obtiener documentos de colaborador
   */
  @Get(':id/documentos')
  async obtenerDocumentosColaborador(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.obtenerDocumentosColaborador(id);
  }

  /**
   * GET /colaboradores/:id/historial
   * Obtiener el historial de las capacitaciones del colaborador
   */
  @Get(':id/historial')
  async obtenerHistorialColaborador(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.obtenerHistorialColaborador(id);
  } 

  /**
   * GET /colaboradores/:id/historial
   * Obtiener el historial de las capacitaciones del colaborador
   */
  @Get(':id/resumen')
  async obtenerResumenlColaborador(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.obtenerResumenColaborador(id);
  }

  /**
   * GET /colaboradores/:id/detalle-plan
   * Obtiener el detalle del plan de induccion del colaborador
   */
  @Get(':id/detalle-plan')
  async obtenerDetallePlanColaborador(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.obtenerDetallePlanColaborador(id);
  }

}
