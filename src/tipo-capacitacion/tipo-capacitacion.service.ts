import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTipoCapacitacionDto } from './dto/create-tipo-capacitacion.dto';
import { UpdateTipoCapacitacionDto } from './dto/update-tipo-capacitacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoCapacitacion } from './entities/tipo-capacitacion.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class TipoCapacitacionService {
  constructor(
    @InjectRepository(TipoCapacitacion)
    private readonly tipoCapacitacionRepository: Repository<TipoCapacitacion>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
  ) {}

  // =========================================================
  // CREATE
  // =========================================================
  async create(createTipoCapacitacionDto: CreateTipoCapacitacionDto) {
    const { NOMBRE } = createTipoCapacitacionDto;

    return this.entityManager.transaction(async (manager) => {
      try {
        const result = await manager.query(
          `EXEC sp_TIPO_CAPACITACION_CREAR @NOMBRE = @0`,
          [NOMBRE],
        );

        const { CODIGO_ESTADO, MENSAJE_SALIDA } = result[0];

        return {
          codigoEstado: CODIGO_ESTADO,
          mensaje: MENSAJE_SALIDA,
        };
      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  // =========================================================
  // FIND ALL (LISTAR ACTIVOS)
  // =========================================================
  async findAll() {
    try {
      const result = await this.entityManager.query(
        `EXEC sp_TIPO_CAPACITACION_LISTAR`,
      );

      return result.map((row: any) => ({
        ID_TIPO_CAPACITACION: row.ID_TIPO_CAPACITACION,
        NOMBRE: row.NOMBRE,
        ESTADO: !!row.ESTADO,
      }));
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  // =========================================================
  // FIND ONE (POR ID)
  // =========================================================
  async findOne(id: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC sp_TIPO_CAPACITACION_POR_ID @ID_TIPO_CAPACITACION = @0`,
        [id],
      );

      // Si el SP devolvió un mensaje de error
      if (result[0]?.CODIGO_ESTADO === 1) {
        throw new NotFoundException(result[0].MENSAJE_SALIDA);
      }

      // Caso normal: devuelve los datos del tipo
      const tipo = result[0];
      if (!tipo) {
        throw new NotFoundException(
          `No se encontró el tipo de capacitación con ID ${id}`,
        );
      }

      return {
        ID_TIPO_CAPACITACION: tipo.ID_TIPO_CAPACITACION,
        NOMBRE: tipo.NOMBRE,
        ESTADO: !!tipo.ESTADO,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  // =========================================================
  // UPDATE (MODIFICAR)
  // =========================================================
  async update(
    id: number,
    updateTipoCapacitacionDto: UpdateTipoCapacitacionDto,
  ) {
    const { NOMBRE } = updateTipoCapacitacionDto;

    return this.entityManager.transaction(async (manager) => {
      try {
        const result = await manager.query(
          `EXEC sp_TIPO_CAPACITACION_MODIFICAR 
            @ID_TIPO_CAPACITACION = @0,
            @NOMBRE = @1`,
          [id, NOMBRE],
        );

        const { CODIGO_ESTADO, MENSAJE_SALIDA } = result[0];

        return {
          codigoEstado: CODIGO_ESTADO,
          mensaje: MENSAJE_SALIDA,
        };
      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  // =========================================================
  // REMOVE (BAJA LÓGICA)
  // =========================================================
  async remove(id: number) {
    return this.entityManager.transaction(async (manager) => {
      try {
        const result = await manager.query(
          `EXEC sp_TIPO_CAPACITACION_BAJA @ID_TIPO_CAPACITACION = @0`,
          [id],
        );

        const { CODIGO_ESTADO, MENSAJE_SALIDA } = result[0];

        return {
          codigoEstado: CODIGO_ESTADO,
          mensaje: MENSAJE_SALIDA,
        };
      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  // =========================================================
  // ALTA (REACTIVAR)
  // =========================================================
  async activar(id: number) {
    return this.entityManager.transaction(async (manager) => {
      try {
        const result = await manager.query(
          `EXEC sp_TIPO_CAPACITACION_ALTA @ID_TIPO_CAPACITACION = @0`,
          [id],
        );

        const { CODIGO_ESTADO, MENSAJE_SALIDA } = result[0];

        return {
          codigoEstado: CODIGO_ESTADO,
          mensaje: MENSAJE_SALIDA,
        };
      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }
}
