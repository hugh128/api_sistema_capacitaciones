import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CapacitacionesService } from './capacitaciones.service';
import { AplicarPlanDto } from './dto/aplicar-plan.dto';
import { AplicarProgramaDto } from './dto/aplicar-programa.dto';
import { AsignarColaboradoresDto } from './dto/asignar-colaboradores.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { ActualizarEstadoCapacitacionDto } from './dto/actualizar-estado.dto';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(
    private readonly capacitacionesService: CapacitacionesService,
  ) {}

  // ========================================
  // PLANES DE CAPACITACIÓN
  // ========================================

  /**
   * POST /capacitaciones/planes/aplicar
   * Aplica un plan de capacitación a colaboradores seleccionados
   */
  @Post('planes/aplicar')
  async aplicarPlan(@Body(ValidationPipe) dto: AplicarPlanDto) {
    return this.capacitacionesService.aplicarPlan(dto);
  }

  // ========================================
  // PROGRAMAS DE CAPACITACIÓN
  // ========================================

  /**
   * POST /capacitaciones/programas/aplicar
   * Aplica un programa de capacitación
   */
  @Post('programas/aplicar')
  async aplicarPrograma(@Body(ValidationPipe) dto: AplicarProgramaDto) {
    return this.capacitacionesService.aplicarPrograma(dto);
  }

  // ========================================
  // CAPACITACIONES - GESTIÓN GENERAL
  // ========================================

  /**
   * GET /capacitaciones/pendientes
   * Obtiene todas las capacitaciones pendientes de asignación (para RRHH)
   */
  @Get('pendientes')
  async obtenerCapacitacionesPendientes() {
    return this.capacitacionesService.obtenerCapacitacionesPendientes();
  }

  /**
   * GET /capacitaciones/:id
   * Obtiene el detalle completo de una capacitación
   */
  @Get(':id')
  async obtenerDetalleCapacitacion(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.obtenerDetalleCapacitacion(id);
  }

  /**
   * GET /capacitaciones/:id/estadisticas
   * Obtiene estadísticas de una capacitación
   */
  @Get(':id/estadisticas')
  async obtenerEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.obtenerEstadisticas(id);
  }

  /**
   * POST /capacitaciones/asignar
   * Asigna colaboradores a una capacitación específica (RRHH)
   */
  @Post('asignar')
  async asignarColaboradores(
    @Body(ValidationPipe) dto: AsignarColaboradoresDto,
  ) {
    return this.capacitacionesService.asignarColaboradores(dto);
  }

  /**
   * PUT /capacitaciones/:id/estado
   * Actualiza el estado de una capacitación
   */
  @Put(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nuevoEstado: string; observaciones?: string },
  ) {
    const dto: ActualizarEstadoCapacitacionDto = {
      idCapacitacion: id,
      nuevoEstado: body.nuevoEstado,
      observaciones: body.observaciones,
    };
    return this.capacitacionesService.actualizarEstado(dto);
  }

  // ========================================
  // COLABORADORES
  // ========================================

  /**
   * GET /capacitaciones/:id/colaboradores
   * Obtiene la lista de colaboradores de una capacitación
   * Query params: filtro (TODOS, PENDIENTES, ASIGNADOS, ASISTIERON, NO_ASISTIERON)
   */
  @Get(':id/colaboradores')
  async obtenerColaboradoresCapacitacion(
    @Param('id', ParseIntPipe) id: number,
    @Query('filtro') filtro: string = 'TODOS',
  ) {
    return this.capacitacionesService.obtenerColaboradoresCapacitacion(
      id,
      filtro,
    );
  }

  /**
   * POST /capacitaciones/:id/colaboradores/:idColaborador/asistencia
   * Registra la asistencia de un colaborador
   */
  @Post(':id/colaboradores/:idColaborador/asistencia')
  async registrarAsistencia(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
    @Body() body: { asistio: boolean; nota?: number; observaciones?: string },
  ) {
    const dto: RegistrarAsistenciaDto = {
      idCapacitacion,
      idColaborador,
      asistio: body.asistio,
      nota: body.nota,
      observaciones: body.observaciones,
    };
    return this.capacitacionesService.registrarAsistencia(dto);
  }

  // ========================================
  // SUBIDA DE ARCHIVOS
  // ========================================

  /**
   * POST /capacitaciones/:id/lista-asistencia
   * Sube la lista de asistencia general (PDF)
   */
  @Post(':id/lista-asistencia')
  @UseInterceptors(FileInterceptor('file'))
  async subirListaAsistencia(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }

    return this.capacitacionesService.subirListaAsistencia(id, file);
  }

  /**
   * POST /capacitaciones/:id/colaboradores/:idColaborador/examen
   * Sube el examen de un colaborador (PDF)
   */
  @Post(':id/colaboradores/:idColaborador/examen')
  @UseInterceptors(FileInterceptor('file'))
  async subirExamen(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }

    return this.capacitacionesService.subirExamen(
      idCapacitacion,
      idColaborador,
      file,
    );
  }

  /**
   * POST /capacitaciones/:id/colaboradores/:idColaborador/diploma
   * Sube el diploma de un colaborador (PDF)
   */
  @Post(':id/colaboradores/:idColaborador/diploma')
  @UseInterceptors(FileInterceptor('file'))
  async subirDiploma(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo PDF');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }

    return this.capacitacionesService.subirDiploma(
      idCapacitacion,
      idColaborador,
      file,
    );
  }

  /**
   * POST /capacitaciones/:id/colaboradores/:idColaborador/asistencia-completa
   * Registra asistencia y sube documentos en una sola llamada
   */
  @Post(':id/colaboradores/:idColaborador/asistencia-completa')
  @UseInterceptors(FileInterceptor('examen'))
  async registrarAsistenciaCompleta(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
    @Body() body: { asistio: boolean; nota?: number; observaciones?: string },
    @UploadedFile() examen?: Express.Multer.File,
  ) {
    let urlExamen: string | undefined;

    if (examen) {
      if (examen.mimetype !== 'application/pdf') {
        throw new BadRequestException('El examen debe ser un PDF');
      }
      const resultExamen = await this.capacitacionesService.subirExamen(
        idCapacitacion,
        idColaborador,
        examen,
      );
      urlExamen = resultExamen.url;
    }

    const dto: RegistrarAsistenciaDto = {
      idCapacitacion,
      idColaborador,
      asistio: body.asistio,
      nota: body.nota,
      observaciones: body.observaciones,
    };

    return this.capacitacionesService.registrarAsistencia(dto, urlExamen);
  }

  /**
   * PUT /capacitaciones/:id/finalizar
   * Finaliza una capacitación y sube lista de asistencia
   */
  @Put(':id/finalizar')
  @UseInterceptors(FileInterceptor('listaAsistencia'))
  async finalizarCapacitacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { observaciones?: string },
    @UploadedFile() listaAsistencia?: Express.Multer.File,
  ) {
    let urlListaAsistencia: string | undefined;

    if (listaAsistencia) {
      if (listaAsistencia.mimetype !== 'application/pdf') {
        throw new BadRequestException(
          'La lista de asistencia debe ser un PDF',
        );
      }
      const result = await this.capacitacionesService.subirListaAsistencia(
        id,
        listaAsistencia,
      );
      urlListaAsistencia = result.url;
    }

    const dto: ActualizarEstadoCapacitacionDto = {
      idCapacitacion: id,
      nuevoEstado: 'FINALIZADA_CAPACITADOR',
      observaciones: body.observaciones,
    };

    return this.capacitacionesService.actualizarEstado(dto, urlListaAsistencia);
  }

  // ========================================
  // DESCARGA DE ARCHIVOS
  // ========================================
  
  /**
   * GET /capacitaciones/:id/lista-asistencia/descargar
   * Descarga la lista de asistencia general
   */
  @Get(':id/lista-asistencia/descargar')
  async descargarListaAsistencia(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.descargarListaAsistencia(id);
  }

  /**
   * GET /capacitaciones/:id/colaboradores/:idColaborador/examen/descargar
   * Descarga el examen de un colaborador
   */
  @Get(':id/colaboradores/:idColaborador/examen/descargar')
  async descargarExamen(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
  ) {
    return this.capacitacionesService.descargarExamen(
      idCapacitacion,
      idColaborador,
    );
  }

  /**
   * GET /capacitaciones/:id/colaboradores/:idColaborador/diploma/descargar
   * Descarga el diploma de un colaborador
   */
  @Get(':id/colaboradores/:idColaborador/diploma/descargar')
  async descargarDiploma(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
  ) {
    return this.capacitacionesService.descargarDiploma(
      idCapacitacion,
      idColaborador,
    );
  }

  /**
   * GET /capacitaciones/:id/documentos
   * Obtiene URLs de descarga para todos los documentos de una capacitación
   */
  @Get(':id/documentos')
  async obtenerDocumentosCapacitacion(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.obtenerDocumentosCapacitacion(id);
  }

  /**
   * GET /capacitaciones/:id/colaboradores/:idColaborador/documentos
   * Obtiene URLs de descarga para todos los documentos de un colaborador
   */
  @Get(':id/colaboradores/:idColaborador/documentos')
  async obtenerDocumentosColaborador(
    @Param('id', ParseIntPipe) idCapacitacion: number,
    @Param('idColaborador', ParseIntPipe) idColaborador: number,
  ) {
    return this.capacitacionesService.obtenerDocumentosColaborador(
      idCapacitacion,
      idColaborador,
    );
  }

  /**
   * GET /capacitaciones/planes/:idPlan/colaboradores-disponibles
   * Obtiene los colaboradores que cumplen con los requisitos de un plan
   */
  @Get('planes/:idPlan/colaboradores-disponibles')
  async obtenerColaboradoresDisponiblesPlan(
    @Param('idPlan', ParseIntPipe) idPlan: number,
  ) {
    return this.capacitacionesService.obtenerColaboradoresDisponiblesPlan(
      idPlan,
    );
  }
  
}
