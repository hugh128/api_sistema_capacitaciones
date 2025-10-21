import { Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} programaDetalle`;
  }

  update(id: number, updateProgramaDetalleDto: UpdateProgramaDetalleDto) {
    return `This action updates a #${id} programaDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} programaDetalle`;
  }
}
