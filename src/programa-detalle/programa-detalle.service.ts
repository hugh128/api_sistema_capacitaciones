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
      APLICA_TODOS_COLABORADORES,
      APLICA_DIPLOMA,
      MES_PROGRAMADO,
      ESTADO,
      DEPARTAMENTOS_IDS,
      PUESTOS_IDS
    } = createProgramaDetalleDto;

    const departamentosJSON = JSON.stringify(DEPARTAMENTOS_IDS);
    const puestosJSON = JSON.stringify(PUESTOS_IDS);


    try {
      
      const programaDetalleResutl = await this.entityManager.query(
        `EXEC sp_PROGRAMA_DETALLE_ALTA
          @PROGRAMA_ID = @0,
          @NOMBRE = @1,
          @CATEGORIA_CAPACITACION = @2,
          @TIPO_CAPACITACION = @3,
          @APLICA_TODOS_COLABORADORES = @4,
          @APLICA_DIPLOMA = @5,
          @MES_PROGRAMADO = @6,
          @ESTADO = @7,
          @DEPARTAMENTOS_IDS = @8,
          @PUESTOS_IDS = @9
        `,
        [
          PROGRAMA_ID,
          NOMBRE,
          CATEGORIA_CAPACITACION,
          TIPO_CAPACITACION,
          APLICA_TODOS_COLABORADORES,
          APLICA_DIPLOMA,
          MES_PROGRAMADO,
          ESTADO,
          departamentosJSON,
          puestosJSON
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
            DEPARTAMENTO: true,
          },
          PUESTO_RELACIONES: {
            PUESTO: true
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
        APLICA_TODOS_COLABORADORES: detalle.APLICA_TODOS_COLABORADORES,
        MES_PROGRAMADO: detalle.MES_PROGRAMADO,
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
        PUESTO_RELACIONES: detalle.PUESTO_RELACIONES.map((rel) => ({
          ID_PUESTO: rel.PUESTO.ID_PUESTO,
          NOMBRE: rel.PUESTO.NOMBRE,
          DESCRIPCION: rel.PUESTO.DESCRIPCION,
          ESTADO: rel.PUESTO.ESTADO
        })),
      }));

      console.log(formattedDetails)

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
