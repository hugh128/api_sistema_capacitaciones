import { Injectable, Logger } from '@nestjs/common';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { StorageService } from 'src/storage/storage.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ColaboradoresService {
  private readonly logger = new Logger(ColaboradoresService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private storageService: StorageService,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  /**
   * Obtiener listado de colaboradores
   */
  async obtenerColaboradores(idEncargado: number | null) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_LISTADO_COLABORADORES @ID_ENCARGADO = @0`,
        [idEncargado]
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener colaboradores', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtiener capacitaciones de un colaborador
   */
  async obtenerCapacitacionesColaborador(idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_CAPACITACIONES_COLABORADOR
          @ID_COLABORADOR = @0`,
          [idColaborador]
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener capacitaciones de colaborador', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtiener documentos de un colaborador
   */
  async obtenerDocumentosColaborador(idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_DOCUMENTOS_COLABORADOR
          @ID_COLABORADOR = @0`,
          [idColaborador]
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener documentos de colaborador', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtiener historial de capacitaciones de un colaborador
   */
  async obtenerHistorialColaborador(idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_HISTORICO_COLABORADOR
          @ID_COLABORADOR = @0`,
          [idColaborador]
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener historial de colaborador', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtiener resumen de capacitaciones de un colaborador
   */
  async obtenerResumenColaborador(idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_RESUMEN_CAPACITACIONES_COLABORADOR
          @ID_COLABORADOR = @0`,
          [idColaborador]
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener resumen de colaborador', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtiener detalle del plan de induccion de un colaborador
   */
  async obtenerDetallePlanColaborador(idColaborador: number) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_COLABORADOR', idColaborador)
        .execute('SP_OBTENER_DETALLE_PLAN_COLABORADOR');
   
      return {
        INFORMACION_COLABORADOR: result.recordsets[0]?.[0] || null,
        PLANES: result.recordsets[1] || [],
        DETALLE_CAPACITACIONES: result.recordsets[2] || []
      };
    } catch (error) {
      this.logger.error('Error al obtener resumen de colaborador', error);
      this.databaseErrorService.handle(error);
    }
  }

}
