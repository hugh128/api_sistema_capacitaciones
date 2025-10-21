import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramaDetalleDto } from './dto/create-programa-detalle.dto';
import { UpdateProgramaDetalleDto } from './dto/update-programa-detalle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramaDetalle } from './entities/programa-detalle.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class ProgramaDetalleService {

  constructor(@InjectRepository(ProgramaDetalle)
    private programaDetalleService: Repository<ProgramaDetalle>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
  ) {}

  async create(createProgramaDetalleDto: CreateProgramaDetalleDto) {

    const {
      PROGRAMA_ID,
      NOMBRE,
      CATEGORIA_CAPACITACION,
      TIPO_CAPACITACION,
      APLICA_TODOS_DEPARTAMENTOS,
      FECHA_PROGRAMADA,
      ESTADO,
      DEPARTAMENTOS_IDS,
    } = createProgramaDetalleDto;

    const departamentosJSON = JSON.stringify(DEPARTAMENTOS_IDS);

    try {
      
      const programaDetalleResutl = await this.entityManager.query(
        `EXEC sp_PROGRAMA_DETALLE_ALTA
          @PROGRAMA_ID = @0,
          @NOMBRE = @1,
          @CATEGORIA_CAPACITACION = @2,
          @TIPO_CAPACITACION = @3,
          @APLICA_TODOS_DEPARTAMENTOS = @4,
          @FECHA_PROGRAMADA = @5,
          @ESTADO = @6,
          @DEPARTAMENTOS_IDS = @7
        `,
        [
          PROGRAMA_ID,
          NOMBRE,
          CATEGORIA_CAPACITACION,
          TIPO_CAPACITACION,
          APLICA_TODOS_DEPARTAMENTOS,
          FECHA_PROGRAMADA,
          ESTADO,
          departamentosJSON,
        ]
      );

      const programDetalleId = programaDetalleResutl[0].ID_DETALLE;
      return programDetalleId;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findAll() {
    try {
      return await this.programaDetalleService.find({
        relations: {
          DEPARTAMENTO_RELACIONES: true
        }
      })
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number) {
    try {
      const programaDetalles = await this.programaDetalleService.find({
        relations: {
          DEPARTAMENTO_RELACIONES: {
            DEPARTAMENTO: true
          }
        },
        where: {
          PROGRAMA_ID: id
        }
      })

      if (!programaDetalles || programaDetalles.length === 0) {
        throw new NotFoundException(`Detalle del programa con ID ${id} no encontrado.`);
      }


      const formattedDetails = programaDetalles.map((detalle) => ({
        ID_DETALLE: detalle.ID_DETALLE,
        NOMBRE: detalle.NOMBRE,
        CATEGORIA_CAPACITACION: detalle.CATEGORIA_CAPACITACION,
        TIPO_CAPACITACION: detalle.TIPO_CAPACITACION,
        APLICA_TODOS_DEPARTAMENTOS: detalle.APLICA_TODOS_DEPARTAMENTOS,
        FECHA_PROGRAMADA: detalle.FECHA_PROGRAMADA,
        ESTADO: detalle.ESTADO,
        PROGRAMA_ID: detalle.PROGRAMA_ID,
        DEPARTAMENTO_RELACIONES: detalle.DEPARTAMENTO_RELACIONES.map((rel) => ({
          ID_DEPARTAMENTO: rel.DEPARTAMENTO.ID_DEPARTAMENTO,
          CODIGO: rel.DEPARTAMENTO.CODIGO,
          NOMBRE: rel.DEPARTAMENTO.NOMBRE,
          DESCRIPCION: rel.DEPARTAMENTO.DESCRIPCION,
          ESTADO: rel.DEPARTAMENTO.ESTADO,
          FECHA_CREACION: rel.DEPARTAMENTO.FECHA_CREACION,
        })),
      }));

      return formattedDetails;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  update(id: number, updateProgramaDetalleDto: UpdateProgramaDetalleDto) {
    return `This action updates a #${id} programaDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} programaDetalle`;
  }
}
