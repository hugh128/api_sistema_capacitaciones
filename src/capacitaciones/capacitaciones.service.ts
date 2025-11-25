import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { AplicarPlanDto } from './dto/aplicar-plan.dto';
import { AplicarProgramaDto } from './dto/aplicar-programa.dto';
import { AsignarColaboradoresDto } from './dto/asignar-colaboradores.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { ActualizarEstadoCapacitacionDto } from './dto/actualizar-estado.dto';
import { DataSource, EntityManager } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { ActualizarEstadoSesionDto } from './dto/actualizar-estado-sesion.dto';
import { RegistrarListadoAsistenciaDto } from './dto/RegistrarListadoAsistenciaDto';
import { ColaboradorAsistenciaDto } from './dto/ColaboradorAsistenciaDto';

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
   * Obtener todas las capacitaciones/sesiones para RRHH
   */
  async obtenerCapacitaciones() {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_VISTA_COMPLETA_CAPACITACIONES_RRHH`,
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener capacitaciones pendientes', error);
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

/*       return {
        success: true,
        data: result,
        total: result.length,
      }; */

      return result;
    } catch (error) {
      this.logger.error('Error al obtener capacitaciones pendientes', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener capacitacion en revision para RRHH
   */
  async obtenerCapacitacionEnRevision(idSesion: number) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_SESION', idSesion)
        .execute('SP_OBTENER_SESION_PARA_REVISION_RRHH');
      
      return {
        SESION: result.recordsets[0]?.[0] || null,
        COLABORADORES: result.recordsets[1] || []
      };

    } catch (error) {
      this.logger.error('Error al obtener capacitaciones en revision', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtiene detalle completo de una sesion
   */
  async obtenerDetalleSesion(idSesion: number) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_SESION', idSesion)
        .execute('SP_OBTENER_DETALLE_SESION');
      
      return {
        SESION: result.recordsets[0]?.[0] || null,
        COLABORADORES: result.recordsets[1] || []
      };

    } catch (error) {
      this.logger.error('Error al obtener capacitaciones en revision', error);
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
         @OBJETIVO = @2,
         @TIPO_CAPACITACION = @3, 
         @MODALIDAD = @4, 
         @APLICA_EXAMEN = @5, 
         @NOTA_MINIMA = @6, 
         @APLICA_DIPLOMA = @7`,
        [
          dto.idCapacitacion,
          dto.idsColaboradores.join(','),
          dto.objetivo || null,
          dto.tipoCapacitacion || null,
          dto.modalidad || null,
          dto.aplicaExamen,
          dto.notaMinima || null,
          dto.aplicaDiploma,
        ],
      );

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
   * Asignar colaboradores a una sesion de una capacitación específica
   */
  async asignarColaboradoresSesion(dto: AsignarColaboradoresDto) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_CREAR_SESION_CAPACITACION 
         @ID_CAPACITACION = @0,
         @NOMBRE_SESION = @1,
         @CAPACITADOR_ID = @2, 
         @FECHA_INICIO = @3, 
         @HORA_INICIO = @4, 
         @HORA_FIN = @5, 
         @GRUPO_OBJETIVO = @6, 
         @IDS_COLABORADORES = @7, 
         @OBSERVACIONES = @8,
         @USUARIO = @9,
         @OBJETIVO = @10,
         @VERSION = @11`,
        [
          dto.idCapacitacion,
          dto.nombreSesion || null,
          dto.capacitadorId || null,
          dto.fechaInicio || null,
          dto.horaInicio || null,
          dto.horaFin || null,
          dto.grupoObjetivo || null,
          dto.idsColaboradores.join(','),
          dto.observaciones || null,
          dto.usuario || null,
          dto.objetivo || null,
          dto.version,
        ],
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Colaboradores asignados exitosamente a la sesion',
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

/*       return {
        success: true,
        data: result,
        total: result.length,
      }; */

      return result;
    } catch (error) {
      this.logger.error('Error al obtener colaboradores de capacitación', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener colaboradores de una capacitación sin sesion
   */
  async obtenerColaboradoresSinSesion(
    idCapacitacion: number,
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_COLABORADORES_SIN_SESION
          @ID_CAPACITACION = @0`,
        [idCapacitacion],
      );

      return result;
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
   * Obtener colaboradores de una capacitación
   */
  async obtenerCapacitacionesPorCapacitador(
    idCapacitacion: number,
    filtro: string | null = null,
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_MIS_CAPACITACIONES_CAPACITADOR
          @ID_CAPACITADOR = @0,
          @FILTRO_ESTADO = @1`,
        [idCapacitacion, filtro],
      );

      return result;
    } catch (error) {
      this.logger.error('Error al obtener colaboradores de capacitación', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener detalle de una sesion de un capacitador
   */
  async obtenerDetalleSesionCapacitador(
    id: number,
    idSesion: number,
  ) {
    try {
      // Obtener el pool de conexiones nativo de mssql
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_SESION', idSesion)
        .input('ID_CAPACITADOR', id)
        .execute('SP_OBTENER_DETALLE_SESION_CAPACITADOR');
      
      return {
        SESION: result.recordsets[0]?.[0] || null,
        COLABORADORES: result.recordsets[1] || []
      };
    } catch (error) {
      this.logger.error('Error al obtener detalle de la sesion', error);
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
   * Actualizar estado de capacitación
   */
  async actualizarEstadoSesion(
    dto: ActualizarEstadoSesionDto,
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_INICIAR_SESION_CAPACITADOR 
         @ID_SESION = @0, 
         @ID_CAPACITADOR = @1,
         @OBSERVACIONES = @2`,
        [
          dto.idSesion,
          dto.idCapacitador,
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
   * Subir lista de asistencia general de una sesion
   */
  async subirListaAsistenciaSesion(
    dto: RegistrarListadoAsistenciaDto,
    idSesion: number,
    file: Express.Multer.File,
  ) {
    try {
      const urlListaAsistencia = await this.storageService.uploadFile(
        file,
        'capacitaciones/listas-asistencia',
      );

      await this.dataSource.query(
        `EXEC SP_FINALIZAR_SESION_CAPACITADOR
          @ID_SESION = @0,
          @ID_CAPACITADOR = @1,
          @URL_LISTA_ASISTENCIA = @2,
          @OBSERVACIONES = @3
        `,
        [idSesion, dto.idCapacitador, urlListaAsistencia, dto.observaciones],
      );

      return {
        success: true,
        message: 'Lista de asistencia subida y sesion finalizada exitosamente.',
        url: urlListaAsistencia,
      };
    } catch (error) {
      this.logger.error('Error al subir lista de asistencia', error);
      throw new Error('Error al subir lista de asistencia');
    }
  }

  /**
   * Registro de asistencia, examen y diploma masivo
  */
  async registrarAsistenciasMasivas(
    idSesion: number,
    colaboradores: ColaboradorAsistenciaDto[],
    files: Express.Multer.File[] = []
  ) {
    try {
      const colaboradoresConUrls = await Promise.all(
        colaboradores.map(async (colab) => {
          let urlExamen: string | undefined;
          let urlDiploma: string | undefined;

          if (colab.asistio) {
            const examenFile = files.find(
              f => f.fieldname === `examen_${colab.idColaborador}`
            );
            if (examenFile) {
              urlExamen = await this.storageService.uploadFile(
                examenFile,
                'capacitaciones/examenes',
              );
            }

            const diplomaFile = files.find(
              f => f.fieldname === `diploma_${colab.idColaborador}`
            );
            if (diplomaFile) {
              urlDiploma = await this.storageService.uploadFile(
                diplomaFile,
                'capacitaciones/diplomas',
              );
            }
          }

          return {
            idColaborador: colab.idColaborador,
            asistio: colab.asistio,
            notaObtenida: colab.notaObtenida,
            urlExamen,
            urlDiploma,
            observaciones: colab.observaciones,
          };
        })
      );

      const pool = (this.dataSource.driver as any).master;
      const colaboradoresJson = JSON.stringify(colaboradoresConUrls);
      
      const result = await pool.request()
        .input('ID_SESION', idSesion)
        .input('COLABORADORES', colaboradoresJson)
        .execute('SP_REGISTRAR_ASISTENCIA_MASIVA');

      return {
        ...result.recordset[0],
        archivosSubidos: {
          examenes: colaboradoresConUrls.filter(c => c.urlExamen).length,
          diplomas: colaboradoresConUrls.filter(c => c.urlDiploma).length,
        },
      };
    } catch (error) {
      this.logger.error('Error al registrar asistencias masivas', error);
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Registro de asistencia de una sesion aprobada
  */
  async aprobarAsistencias(
    idSesion: number,
    colaboradores: ColaboradorAsistenciaDto[],
    usuario: string
  ) {
    try {
      const colaboradoresData = colaboradores.map((colab) => ({
        idColaborador: colab.idColaborador,
        asistio: colab.asistio,
        notaObtenida: colab.notaObtenida ?? null,
        observaciones: colab.observaciones ?? null,
      }));

      const pool = (this.dataSource.driver as any).master;
      const colaboradoresJson = JSON.stringify(colaboradoresData);

      const result = await pool.request()
        .input('ID_SESION', idSesion)
        .input('COLABORADORES', colaboradoresJson)
        .input('USUARIO_RRHH', usuario)
        .execute('SP_RRHH_ACTUALIZAR_COLABORADORES_MASIVO');

      return result.recordset[0];
    } catch (error) {
      this.logger.error('Error al registrar asistencias masivas', error);
      this.databaseErrorService.handle(error);
    }
  }


  /**
   * RRHH aprueba una sesion
   */
  async aprobarSesion(
    idSesion: number,
    usuario: string,
    observaciones: string
  ) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_RRHH_APROBAR_SESION 
         @ID_SESION = @0, 
         @USUARIO_RRHH = @1,
         @OBSERVACIONES_RRHH = @2`,
        [
          idSesion,
          usuario,
          observaciones,
        ],
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Sesion aprobada exitosamente.',
        data: result[0],
      };
    } catch (error) {
      this.logger.error('Error al aprobar sesion', error);
      this.databaseErrorService.handle(error);
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
        `EXEC SP_OBTENER_DETALLE_CAPACITACION @ID_CAPACITACION = @0`,
        [idCapacitacion],
      )

      if (result.length === 0) {
        throw new NotFoundException('Capacitación no encontrada');
      }

      return result[0];
    } catch (error) {
      this.logger.error('Error al obtener detalle de capacitación', error);
      throw error;
    }
  }

  /**
   * Descargar lista de asistencia general
   */
  async descargarListaAsistencia(idSesion: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT URL_LISTA_ASISTENCIA 
         FROM CAPACITACION_SESION 
         WHERE ID_SESION = @0`,
        [idSesion],
      );

      if (result.length === 0) {
        throw new NotFoundException('Sesion no encontrada');
      }

      const urlListaAsistencia = result[0].URL_LISTA_ASISTENCIA as string;

      if (!urlListaAsistencia) {
        throw new NotFoundException('No existe lista de asistencia para esta sesion');
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
  async descargarExamen(isSesion: number, idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT URL_EXAMEN 
         FROM CAPACITACION_COLABORADOR 
         WHERE ID_SESION = @0 AND ID_COLABORADOR = @1`,
        [isSesion, idColaborador],
      );

      if (result.length === 0) {
        throw new NotFoundException('Registro de sesion no encontrada');
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
  async descargarDiploma(isSesion: number, idColaborador: number) {
    try {
      const result = await this.entityManager.query(
        `SELECT URL_DIPLOMA 
         FROM CAPACITACION_COLABORADOR 
         WHERE ID_SESION = @0 AND ID_COLABORADOR = @1`,
        [isSesion, idColaborador],
      );

      if (result.length === 0) {
        throw new NotFoundException('Registro de sesion no encontrada');
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

  /**
   * Obtener colaboradores disponibles para un plan
   */
  async obtenerColaboradoresDisponiblesPlan(idPlan: number) {
    try {

      const result = await this.entityManager.query(
        'EXEC SP_OBTENER_COLABORADORES_DISPONIBLES_PLAN @ID_PLAN = @0',
        [idPlan]
      );

      // Separar colaboradores con plan ya aplicado de los que no
      const colaboradores = result;
      const disponibles = colaboradores.filter(
        (c) => c.PLAN_YA_APLICADO === 0,
      );
      const yaAplicados = colaboradores.filter(
        (c) => c.PLAN_YA_APLICADO === 1,
      );

      return {
        success: true,
        data: {
          disponibles,
          yaAplicados,
          totalDisponibles: disponibles.length,
          totalYaAplicados: yaAplicados.length,
          todos: colaboradores,
        },
      };
    } catch (error) {
      this.logger.error(
        'Error al obtener colaboradores disponibles para plan',
        error,
      );
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Obtener plantilla de examen de una sesion
   */
  async obtenerPlantillaExamen(idSesion: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_OBTENER_PLANTILLA_EXAMEN
          @ID_SESION = @0`,
          [idSesion]
      );

      const plantillaDB = result[0];

      if (plantillaDB && plantillaDB.CONTENIDO_JSON) {
        const contenidoValor = plantillaDB.CONTENIDO_JSON;
        const contenidoJsonString =
          typeof contenidoValor === 'string'
            ? contenidoValor
            : JSON.stringify(contenidoValor);

        const contenidoJsonObjeto = JSON.parse(contenidoJsonString);

        return contenidoJsonObjeto;
      }

      return null;

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  /**
   * Guardar plantilla de examen de una sesion
   */
  async guardarPlantillaExamen(idSesion: number, plantilla: any, usuario: string) {
    try {
      const contenidoJsonString = JSON.stringify(plantilla);

      const result = await this.entityManager.query(
        `EXEC SP_GUARDAR_PLANTILLA_EXAMEN
          @ID_SESION = @0,
          @CONTENIDO_JSON = @1,
          @USUARIO = @2`,
          [
            idSesion,
            contenidoJsonString,
            usuario,
          ]
      );

      return {
        success: true,
        message: result[0]?.Mensaje || 'Plantilla guardada exitosamente.',
        data: result[0],
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

}
