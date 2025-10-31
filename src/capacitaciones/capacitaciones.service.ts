import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { AplicarPlanDto } from './dto/aplicar-plan.dto';
import { AplicarProgramaDto } from './dto/aplicar-programa.dto';
import { AsignarColaboradoresDto } from './dto/asignar-colaboradores.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { ActualizarEstadoCapacitacionDto } from './dto/actualizar-estado.dto';
import { DataSource, EntityManager } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class CapacitacionesService {
  private readonly logger = new Logger(CapacitacionesService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private storageService: StorageService,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  /**
   * Aplicar un plan de capacitación a colaboradores
   */
  async aplicarPlan(dto: AplicarPlanDto) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_APLICAR_PLAN_COLABORADORES
          @ID_PLAN = @0,
          @IDS_COLABORADORES = @1,
          @USUARIO = @2`,
        [
          dto.idPlan,
          dto.idsColaboradores.join(','),
          dto.usuario
        ],
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Plan aplicado exitosamente',
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al aplicar plan', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Aplicar un programa de capacitación
   */
  async aplicarPrograma(dto: AplicarProgramaDto) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_APLICAR_PROGRAMA_COLABORADORES 
         @ID_PROGRAMA = @0,
         @USUARIO = @1`,
        [
          dto.idPrograma,
          dto.usuario,
        ],
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Programa aplicado exitosamente',
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al aplicar programa', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener capacitaciones pendientes para RRHH
   */
  async obtenerCapacitacionesPendientes() {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_CAPACITACIONES_PENDIENTES`,
      );

      return {
        success: true,
        data: result,
        total: result.length,
      };
    } catch (error) {
      this.logger.error('Error al obtener capacitaciones pendientes', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Asignar colaboradores a una capacitación específica
   */
  async asignarColaboradores(dto: AsignarColaboradoresDto) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_ASIGNAR_COLABORADORES_CAPACITACION 
         @ID_CAPACITACION = @0, 
         @IDS_COLABORADORES = @1, 
         @CAPACITADOR_ID = @2, 
         @FECHA_INICIO = @3, 
         @HORA_INICIO = @4, 
         @HORA_FIN = @5, 
         @TIPO_CAPACITACION = @6, 
         @MODALIDAD = @7, 
         @GRUPO_OBJETIVO = @8, 
         @OBJETIVO = @9, 
         @APLICA_EXAMEN = @10, 
         @NOTA_MINIMA = @11, 
         @APLICA_DIPLOMA = @12, 
         @OBSERVACIONES = @13`,
        [
          dto.idCapacitacion,
          dto.idsColaboradores.join(','),
          dto.capacitadorId || null,
          dto.fechaInicio || null,
          dto.horaInicio || null,
          dto.horaFin || null,
          dto.tipoCapacitacion || null,
          dto.modalidad || null,
          dto.grupoObjetivo || null,
          dto.objetivo || null,
          dto.aplicaExamen,
          dto.notaMinima || null,
          dto.aplicaDiploma,
          dto.observaciones || null,
        ],
      );

      console.log("Resultado: ")
      console.log(result)

      return {
        success: true,
        message: result[0]?.Mensaje || 'Colaboradores asignados exitosamente',
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al asignar colaboradores', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener colaboradores de una capacitación
   */
  async obtenerColaboradoresCapacitacion(
    idCapacitacion: number,
    filtro: string = 'TODOS',
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_COLABORADORES_CAPACITACION
          @ID_CAPACITACION = @0,
          @FILTRO = @1`,
        [idCapacitacion, filtro],
      );

      return {
        success: true,
        data: result,
        total: result.length,
      };
    } catch (error) {
      this.logger.error('Error al obtener colaboradores de capacitación', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Registrar asistencia individual
   */
  async registrarAsistencia(
    dto: RegistrarAsistenciaDto,
    urlExamen?: string,
    urlDiploma?: string,
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_REGISTRAR_ASISTENCIA 
         @ID_CAPACITACION = @0, 
         @ID_COLABORADOR = @1, 
         @ASISTIO = @2, 
         @NOTA = @3, 
         @URL_EXAMEN = @4, 
         @URL_DIPLOMA = @5, 
         @OBSERVACIONES = @6`,
        [
          dto.idCapacitacion,
          dto.idColaborador,
          dto.asistio,
          dto.nota || null,
          urlExamen || null,
          urlDiploma || null,
          dto.observaciones || null,
        ],
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Asistencia registrada exitosamente',
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al registrar asistencia', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Actualizar estado de capacitación
   */
  async actualizarEstado(
    dto: ActualizarEstadoCapacitacionDto,
    urlListaAsistencia?: string,
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_ACTUALIZAR_ESTADO_CAPACITACION 
         @ID_CAPACITACION = @0, 
         @NUEVO_ESTADO = @1, 
         @URL_LISTA_ASISTENCIA = @2, 
         @OBSERVACIONES = @3`,
        [
          dto.idCapacitacion,
          dto.nuevoEstado,
          urlListaAsistencia || null,
          dto.observaciones || null,
        ],
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Estado actualizado exitosamente',
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al actualizar estado', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener estadísticas de una capacitación
   */
  async obtenerEstadisticas(idCapacitacion: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_ESTADISTICAS_CAPACITACION @ID_CAPACITACION = 0`,
        [idCapacitacion],
      );

      if (result.length === 0) {
        throw new NotFoundException('Capacitación no encontrada');
      }

      return {
        success: true,
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Subir lista de asistencia general
   */
  async subirListaAsistencia(
    idCapacitacion: number,
    file: Express.Multer.File,
  ) {
    try {
      const urlListaAsistencia = await this.storageService.uploadFile(
        file,
        'capacitaciones/listas-asistencia',
      );

      await this.dataSource.query(
        `UPDATE CAPACITACION 
         SET URL_LISTA_ASISTENCIA = @0, FECHA_MODIFICACION = GETDATE() 
         WHERE ID_CAPACITACION = @1`,
        [urlListaAsistencia, idCapacitacion],
      );

      return {
        success: true,
        message: 'Lista de asistencia subida exitosamente',
        url: urlListaAsistencia,
      };
    } catch (error) {
      this.logger.error('Error al subir lista de asistencia', error);
      throw new Error('Error al subir lista de asistencia');
    }
  }

  /**
   * Subir examen individual
   */
  async subirExamen(
    idCapacitacion: number,
    idColaborador: number,
    file: Express.Multer.File,
  ) {
    try {
      const urlExamen = await this.storageService.uploadFile(file, 'capacitaciones/examenes');

      await this.dataSource.query(
        `UPDATE CAPACITACION_COLABORADOR 
         SET URL_EXAMEN = @0
         WHERE ID_CAPACITACION = @1 AND ID_COLABORADOR = @2`,
        [urlExamen, idCapacitacion, idColaborador],
      );

      return {
        success: true,
        message: 'Examen subido exitosamente',
        url: urlExamen,
      };
    } catch (error) {
      this.logger.error('Error al subir examen', error);
      throw new Error('Error al subir examen');
    }
  }

  /**
   * Subir diploma individual
   */
  async subirDiploma(
    idCapacitacion: number,
    idColaborador: number,
    file: Express.Multer.File,
  ) {
    try {
      const urlDiploma = await this.storageService.uploadFile(file, 'capacitaciones/diplomas');

      await this.dataSource.query(
        `UPDATE CAPACITACION_COLABORADOR 
         SET URL_DIPLOMA = @0 
         WHERE ID_CAPACITACION = @1 AND ID_COLABORADOR = @2`,
        [urlDiploma, idCapacitacion, idColaborador],
      );

      return {
        success: true,
        message: 'Diploma subido exitosamente',
        url: urlDiploma,
      };
    } catch (error) {
      this.logger.error('Error al subir diploma', error);
      throw new Error('Error al subir diploma');
    }
  }

  /**
   * Obtener detalle de una capacitación
   */
  async obtenerDetalleCapacitacion(idCapacitacion: number) {
    try {
      const result = await this.entityManager.query(
        `
        SELECT 
          C.*,
          CAP.NOMBRE + ' ' + CAP.APELLIDO AS CAPACITADOR_NOMBRE,
          CAP.CORREO AS CAPACITADOR_CORREO,
          CASE 
            WHEN C.ID_PLAN IS NOT NULL THEN 'PLAN'
            WHEN C.ID_PROGRAMA IS NOT NULL THEN 'PROGRAMA'
          END AS TIPO_ORIGEN,
          ISNULL(PC.NOMBRE, PROG.NOMBRE) AS NOMBRE_ORIGEN,
          (SELECT STRING_AGG(DA.NOMBRE_DOCUMENTO, ', ')
           FROM CAPACITACION_DOCUMENTO_ASOCIADO CDA
           INNER JOIN DOCUMENTO_ASOCIADO DA ON CDA.ID_DOC_ASOCIADO = DA.ID_DOC_ASOCIADO
           WHERE CDA.ID_CAPACITACION = C.ID_CAPACITACION) AS TEMAS
        FROM CAPACITACION C
        LEFT JOIN PERSONA CAP ON C.CAPACITADOR_ID = CAP.ID_PERSONA
        LEFT JOIN PLAN_CAPACITACION PC ON C.ID_PLAN = PC.ID_PLAN
        LEFT JOIN PROGRAMA_CAPACITACION PROG ON C.ID_PROGRAMA = PROG.ID_PROGRAMA
        WHERE C.ID_CAPACITACION = ?
      `,
        [idCapacitacion],
      );

      if (result.length === 0) {
        throw new NotFoundException('Capacitación no encontrada');
      }

      return {
        success: true,
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al obtener detalle de capacitación', error);
      throw error;
    }
  }

  /**
   * Descargar lista de asistencia general
   */
  async descargarListaAsistencia(idCapacitacion: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT URL_LISTA_ASISTENCIA 
         FROM CAPACITACION 
         WHERE ID_CAPACITACION = @0`,
        [idCapacitacion],
      );

      console.log("Resultado de descarga de asistencia:")
      console.log(result)

      if (result.length === 0) {
        throw new NotFoundException('Capacitación no encontrada');
      }

      const urlListaAsistencia = result[0].URL_LISTA_ASISTENCIA as string;

      if (!urlListaAsistencia) {
        throw new NotFoundException('No existe lista de asistencia para esta capacitación');
      }

      // Generar URL firmada con expiración de 1 hora
      const signedUrl = await this.storageService.getSignedDownloadUrl(
        urlListaAsistencia,
        3600,
      );

      return {
        success: true,
        message: 'URL de descarga generada exitosamente',
        url: signedUrl,
        expiresIn: 3600, // segundos
      };
    } catch (error) {
      this.logger.error('Error al descargar lista de asistencia', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Descargar examen de un colaborador
   */
  async descargarExamen(idCapacitacion: number, idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT URL_EXAMEN 
         FROM CAPACITACION_COLABORADOR 
         WHERE ID_CAPACITACION = @0 AND ID_COLABORADOR = @1`,
        [idCapacitacion, idColaborador],
      );

      if (result.length === 0) {
        throw new NotFoundException('Registro de capacitación no encontrado');
      }

      const urlExamen = result[0].URL_EXAMEN as string;

      if (!urlExamen) {
        throw new NotFoundException('No existe examen para este colaborador');
      }

      const signedUrl = await this.storageService.getSignedDownloadUrl(
        urlExamen,
        3600,
      );

      return {
        success: true,
        message: 'URL de descarga generada exitosamente',
        url: signedUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error('Error al descargar examen', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Descargar diploma de un colaborador
   */
  async descargarDiploma(idCapacitacion: number, idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT URL_DIPLOMA 
         FROM CAPACITACION_COLABORADOR 
         WHERE ID_CAPACITACION = @0 AND ID_COLABORADOR = @1`,
        [idCapacitacion, idColaborador],
      );

      if (result.length === 0) {
        throw new NotFoundException('Registro de capacitación no encontrado');
      }

      const urlDiploma = result[0].URL_DIPLOMA as string;

      if (!urlDiploma) {
        throw new NotFoundException('No existe diploma para este colaborador');
      }

      const signedUrl = await this.storageService.getSignedDownloadUrl(
        urlDiploma,
        3600,
      );

      return {
        success: true,
        message: 'URL de descarga generada exitosamente',
        url: signedUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error('Error al descargar diploma', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener todos los documentos disponibles de una capacitación
   */
  async obtenerDocumentosCapacitacion(idCapacitacion: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT 
          ID_CAPACITACION,
          URL_LISTA_ASISTENCIA,
          CASE WHEN URL_LISTA_ASISTENCIA IS NOT NULL THEN 1 ELSE 0 END AS TIENE_LISTA_ASISTENCIA
         FROM CAPACITACION 
         WHERE ID_CAPACITACION = @0`,
        [idCapacitacion],
      );

      if (result.length === 0) {
        throw new NotFoundException('Capacitación no encontrada');
      }

      const capacitacion = result[0] as {
        ID_CAPACITACION: number;
        URL_LISTA_ASISTENCIA: string | null;
        TIENE_LISTA_ASISTENCIA: number;
      };

      const documentos: any = {
        idCapacitacion: capacitacion.ID_CAPACITACION,
        listaAsistencia: null,
      };

      // Generar URL firmada si existe la lista de asistencia
      if (capacitacion.URL_LISTA_ASISTENCIA) {
        const signedUrl = await this.storageService.getSignedDownloadUrl(
          capacitacion.URL_LISTA_ASISTENCIA,
          3600,
        );
        documentos.listaAsistencia = {
          url: signedUrl,
          expiresIn: 3600,
        };
      }

      return {
        success: true,
        data: documentos,
      };
    } catch (error) {
      this.logger.error('Error al obtener documentos de capacitación', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener todos los documentos de un colaborador en una capacitación
   */
  async obtenerDocumentosColaborador(
    idCapacitacion: number,
    idColaborador: number,
  ) {
    try {
      const result = await this.entityManager.query(
        `SELECT 
          ID_CAPACITACION,
          ID_COLABORADOR,
          URL_EXAMEN,
          URL_DIPLOMA,
          CASE WHEN URL_EXAMEN IS NOT NULL THEN 1 ELSE 0 END AS TIENE_EXAMEN,
          CASE WHEN URL_DIPLOMA IS NOT NULL THEN 1 ELSE 0 END AS TIENE_DIPLOMA
         FROM CAPACITACION_COLABORADOR 
         WHERE ID_CAPACITACION = @0 AND ID_COLABORADOR = @1`,
        [idCapacitacion, idColaborador],
      );

      if (result.length === 0) {
        throw new NotFoundException('Registro de capacitación no encontrado');
      }

      const registro = result[0] as {
        ID_CAPACITACION: number;
        ID_COLABORADOR: number;
        URL_EXAMEN: string | null;
        URL_DIPLOMA: string | null;
        TIENE_EXAMEN: number;
        TIENE_DIPLOMA: number;
      };

      const documentos: any = {
        idCapacitacion: registro.ID_CAPACITACION,
        idColaborador: registro.ID_COLABORADOR,
        examen: null,
        diploma: null,
      };

      // Generar URLs firmadas si existen los documentos
      if (registro.URL_EXAMEN) {
        const signedUrlExamen = await this.storageService.getSignedDownloadUrl(
          registro.URL_EXAMEN,
          3600,
        );
        documentos.examen = {
          url: signedUrlExamen,
          expiresIn: 3600,
        };
      }

      if (registro.URL_DIPLOMA) {
        const signedUrlDiploma = await this.storageService.getSignedDownloadUrl(
          registro.URL_DIPLOMA,
          3600,
        );
        documentos.diploma = {
          url: signedUrlDiploma,
          expiresIn: 3600,
        };
      }

      return {
        success: true,
        data: documentos,
      };
    } catch (error) {
      this.logger.error('Error al obtener documentos del colaborador', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.databaseErrorService.handle(error);
    }
  }
}
