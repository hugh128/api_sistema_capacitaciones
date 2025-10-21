import { Injectable } from '@nestjs/common';
import { CreateProgramaCapacitacionDto } from './dto/create-programa-capacitacion.dto';
import { UpdateProgramaCapacitacionDto } from './dto/update-programa-capacitacion.dto';
import { EntityManager, Repository } from 'typeorm';
import { ProgramaCapacitacion } from './entities/programa-capacitacion.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProgramaCapacitacionService {
  
  constructor(@InjectRepository(ProgramaCapacitacion)
    private programaCapacitacionRepository: Repository<ProgramaCapacitacion>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
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
          },
        },
      });

      const formatted = programas.map((programa) => ({
        ...programa,
        PROGRAMA_DETALLES: programa.PROGRAMA_DETALLES.map((detalle) => ({
          ...detalle,
          DEPARTAMENTO_RELACIONES: detalle.DEPARTAMENTO_RELACIONES.map(
            (rel) => rel.DEPARTAMENTO
          ),
        })),
      }));

      return formatted;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} programaCapacitacion`;
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
