import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramaCapacitacionDto } from './dto/create-programa-capacitacion.dto';
import { UpdateProgramaCapacitacionDto } from './dto/update-programa-capacitacion.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ProgramaCapacitacion } from './entities/programa-capacitacion.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProgramaCapacitacionService {
  
  constructor(@InjectRepository(ProgramaCapacitacion)
    private programaCapacitacionRepository: Repository<ProgramaCapacitacion>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProgramaCapacitacionDto: CreateProgramaCapacitacionDto) {
    const {
      NOMBRE,
      DESCRIPCION,
      TIPO,
      PERIODO,
      ESTADO,
      PROGRAMA_DETALLES,
    } = createProgramaCapacitacionDto;

    const detallesJSON = JSON.stringify(PROGRAMA_DETALLES);

    try {
      const programaResult = await this.entityManager.query(
        `EXEC sp_PROGRAMA_CAPACITACION_ALTA
          @NOMBRE = @0,
          @DESCRIPCION = @1,
          @TIPO = @2,
          @PERIODO = @3,
          @ESTADO = @4,
          @PROGRAMA_DETALLES_JSON = @5
        `,
        [
          NOMBRE,
          DESCRIPCION,
          TIPO,
          PERIODO,
          ESTADO,
          detallesJSON
        ]
      );

      const programId = programaResult[0].ID_PROGRAMA;
      return programId;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findAll() {
    try {
      const programas = await this.programaCapacitacionRepository.find({
        relations: {
          PROGRAMA_DETALLES: {
            DEPARTAMENTO_RELACIONES: {
              DEPARTAMENTO: true,
            },
            PUESTO_RELACIONES: {
              PUESTO: true
            }
          },
        },
        order: {
          ID_PROGRAMA: 'DESC',
        },
      });

      const formatted = programas.map((programa) => ({
        ...programa,
        PROGRAMA_DETALLES: programa.PROGRAMA_DETALLES
          .sort((a, b) => {
            if (a.CATEGORIA_CAPACITACION < b.CATEGORIA_CAPACITACION) return 1;
            if (a.CATEGORIA_CAPACITACION > b.CATEGORIA_CAPACITACION) return -1;
            return 0;
          })
          .map((detalle) => ({
            ...detalle,
            DEPARTAMENTO_RELACIONES: detalle.DEPARTAMENTO_RELACIONES.map(
              (rel) => rel.DEPARTAMENTO
            ),
            PUESTO_RELACIONES: detalle.PUESTO_RELACIONES.map(
              (rel) => rel.PUESTO
            ),
          })),
      }));

      return formatted;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number) {
    try {
      const programa = await this.programaCapacitacionRepository.findOne({
        relations: {
          PROGRAMA_DETALLES: {
            DEPARTAMENTO_RELACIONES: {
              DEPARTAMENTO: true,
            }
          }
        },
        where: {
          ID_PROGRAMA: id
        },
      })

      if (!programa) {
        throw new NotFoundException(`Programa de capacitacion con ID ${id} no encontrado.`);
      }

      const formattedProgram = {
        ...programa,
        PROGRAMA_DETALLES: programa.PROGRAMA_DETALLES.map((detalle) => ({
          ...detalle,
          DEPARTAMENTO_RELACIONES: detalle.DEPARTAMENTO_RELACIONES.map(
            (rel) => rel.DEPARTAMENTO
          ),
        })),
      };

      return formattedProgram;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async obtenerDetalleProgramaConColaboradores(idPrograma: number) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_PROGRAMA', idPrograma)
        .execute('SP_OBTENER_PROGRAMA_DETALLADO');
      
      const detallePrograma = result.recordsets[0]?.[0] || null;
      const capacitacionesPrograma = result.recordsets[1] || [];
      const colaboradoresRaw = result.recordsets[2] || [];
      
      const colaboradoresMap = new Map();
      
      colaboradoresRaw.forEach(row => {
        const colaboradorId = row.ID_COLABORADOR;
        
        if (!colaboradoresMap.has(colaboradorId)) {
          colaboradoresMap.set(colaboradorId, {
            ID_COLABORADOR: row.ID_COLABORADOR,
            NOMBRE: row.NOMBRE,
            APELLIDO: row.APELLIDO,
            NOMBRE_COMPLETO: row.NOMBRE_COMPLETO,
            INICIALES: row.INICIALES,
            ESTADO_COLABORADOR: row.ESTADO_COLABORADOR,
            PUESTO: row.PUESTO,
            DEPARTAMENTO: row.DEPARTAMENTO,
            CODIGO_DEPARTAMENTO: row.CODIGO_DEPARTAMENTO,
            CORREO: row.CORREO,
            FECHA_ASIGNACION: row.FECHA_ASIGNACION,
            USUARIO_APLICA: row.USUARIO_APLICA,
            CAPACITACIONES_ASIGNADAS: [] 
          });
        }
        
        colaboradoresMap.get(colaboradorId).CAPACITACIONES_ASIGNADAS.push({
          ID_CAPACITACION: row.ID_CAPACITACION,
          ID_DETALLE: row.ID_DETALLE_PROGRAMA,
          NOMBRE: row.NOMBRE_CAPACITACION,
          INICIALES: row.INICIALES,
          CATEGORIA_CAPACITACION: row.CATEGORIA_CAPACITACION,
          TIPO_CAPACITACION: row.TIPO_CAPACITACION,
          MES_PROGRAMADO: row.MES_PROGRAMADO,
          COMPLETADA: row.COMPLETADA === 1,
          ESTADO_CAPACITACION: row.ESTADO_CAPACITACION,
          ID_SESION: row.ID_SESION,
          NUMERO_SESION: row.NUMERO_SESION,
          NOMBRE_SESION: row.NOMBRE_SESION,
          FECHA_PROGRAMADA: row.FECHA_PROGRAMADA,
          ESTADO_SESION: row.ESTADO_SESION,
          ASISTIO: row.ASISTIO,
          FECHA_ASISTENCIA: row.FECHA_ASISTENCIA,
          NOTA_OBTENIDA: row.NOTA_OBTENIDA,
          APROBADO: row.APROBADO,
          FECHA_ASIGNACION_CAPACITACION: row.FECHA_ASIGNACION_CAPACITACION
        });
      });
      
      const colaboradoresAgrupados = Array.from(colaboradoresMap.values());
      
      return {
        DETALLE_PROGRAMA: detallePrograma,
        CAPACITACIONES_PROGRAMA: capacitacionesPrograma,
        COLABORADORES_PROGRAMA: colaboradoresAgrupados,
      };

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(id: number, updateProgramaCapacitacionDto: UpdateProgramaCapacitacionDto) {
    const {
      NOMBRE,
      DESCRIPCION,
      TIPO,
      PERIODO,
      ESTADO,
      PROGRAMA_DETALLES,
    } = updateProgramaCapacitacionDto;

    const detallesJSON = JSON.stringify(PROGRAMA_DETALLES);

    try {
      const programaResult = await this.entityManager.query(
        `EXEC sp_PROGRAMA_CAPACITACION_ACTUALIZAR
          @ID_PROGRAMA = @0,
          @NOMBRE = @1,
          @DESCRIPCION = @2,
          @TIPO = @3,
          @PERIODO = @4,
          @ESTADO = @5,
          @PROGRAMA_DETALLES_JSON = @6
        `,
        [
          id,
          NOMBRE,
          DESCRIPCION,
          TIPO,
          PERIODO,
          ESTADO,
          detallesJSON
        ]
      );

      const programId = programaResult[0].ID_PROGRAMA;
      return programId;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} programaCapacitacion`;
  }
}
