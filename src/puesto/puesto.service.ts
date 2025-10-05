import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Puesto } from './entities/puesto.entity';
import { EntityManager, Repository } from 'typeorm';
import { handleDbError } from 'src/utils/database-error.util';

@Injectable()
export class PuestoService {

  constructor(@InjectRepository(Puesto)
    private puestoReposity: Repository<Puesto>,
    private readonly entityManager: EntityManager
  ) {}

  async create(createPuestoDto: CreatePuestoDto) {
    try {
      
      const { nombre, descripcion, estado, departamentoId } = createPuestoDto;

      const result = await this.entityManager.query(
        `EXEC sp_PUESTO_ALTA 
          @NOMBRE = @0,
          @DESCRIPCION = @1, 
          @ESTADO = @2, 
          @DEPARTAMENTO_ID = @3`, 
        [
          nombre,
          descripcion,
          estado,
          departamentoId
        ]
      );

      if (result && result.length > 0 && result[0].ID_PUESTO !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID del puesto.');
      }

    } catch (error) {
      handleDbError(error)
    }
  }

  async findAll() {
    try {
      return await this.puestoReposity.find()
    } catch (error) {
      handleDbError(error)
    }
  }

  async findOne(id: number) {
    try {
      const puesto = await this.puestoReposity.findOneBy({
        ID_PUESTO: id
      })

      if (!puesto) {
          throw new NotFoundException(`Puesto con ID ${id} no encontrado.`);
      }

      return puesto;
    } catch (error) {
      handleDbError(error)
    }
  }

  async update(id: number, updatePuestoDto: UpdatePuestoDto) {
    try {
      const { nombre, descripcion, estado, departamentoId } = updatePuestoDto;

      const result = await this.entityManager.query(
        `EXEC sp_PUESTO_ACTUALIZAR
          @ID_PUESTO = @0, 
          @NOMBRE = @1, 
          @DESCRIPCION = @2, 
          @ESTADO = @3,
          @DEPARTAMENTO_ID = @4`, 
        [
          id,
          nombre,
          descripcion,
          estado,
          departamentoId
        ]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
          return {
              message: spResult.Message,
              id: spResult.ID_PUESTO
          };
      }
      
      if (spResult && spResult.Success === 0) {
          return {
              message: spResult.Message,
              id: spResult.ID_PUESTO
          };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado al actualizar puesto.');

    } catch (error) {
      handleDbError(error)
    }
  }

  async remove(id: number) {
    try {
      
      const result = await this.entityManager.query(
        `EXEC sp_PUESTO_BAJA @ID_PUESTO = @0`,
        [id]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
          return { 
              message: spResult.Message, 
              id: spResult.ID_PUESTO 
          };
      }
      
      if (spResult && spResult.Success === 0) {
          return { 
              message: spResult.Message, 
              id: spResult.ID_PUESTO 
          };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado al borrar puesto.');

    } catch (error) {
      handleDbError(error);
    }
  }
}
