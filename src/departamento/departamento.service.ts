import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';
import { EntityManager, Repository } from 'typeorm';
import { handleDbError } from 'src/utils/database-error.util';

@Injectable()
export class DepartamentoService {

  constructor(@InjectRepository(Departamento)
    private departamentoRepository: Repository<Departamento>,
    private readonly entityManager: EntityManager
  ) {}

  async create(createDepartamentoDto: CreateDepartamentoDto) {
    try {
      const { NOMBRE, DESCRIPCION, ESTADO } = createDepartamentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DEPARTAMENTO_ALTA 
            @NOMBRE = @0, 
            @DESCRIPCION = @1, 
            @ESTADO = @2`, 
        [
          NOMBRE,
          DESCRIPCION,
          ESTADO
        ]
      );

      if (result && result.length > 0 && result[0].ID_DEPARTAMENTO !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID del departamento.');
      }

    } catch (error) {
      handleDbError(error);
    }
  }

  async findAll() {
    try {
      return await this.departamentoRepository.find();
    } catch (error) {
      handleDbError(error);      
    }
  }

  async findOne(id: number): Promise<Departamento> {
    try {
      const departamento = await this.departamentoRepository.findOneBy({
        ID_DEPARTAMENTO: id
      })

      if (!departamento) {
        throw new NotFoundException(`Departamento con ID ${id} no encontrado.`);
      }

      return departamento;
    } catch (error) {
      handleDbError(error);
    }
  }

  async update(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    try {
      const { NOMBRE, DESCRIPCION, ESTADO } = updateDepartamentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DEPARTAMENTO_ACTUALIZAR
            @ID_DEPARTAMENTO = @0,
            @NOMBRE = @1,
            @DESCRIPCION = @2,
            @ESTADO = @3`,
        [
          id,
          NOMBRE,
          DESCRIPCION,
          ESTADO
        ]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
        return {
          message: spResult.Message,
          id: spResult.ID_DEPARTAMENTO
        };
      }
      
      if (spResult && spResult.Success === 0) {
        return {
          message: spResult.Message,
          id: spResult.ID_DEPARTAMENTO
        };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado.');

    } catch (error) {
      handleDbError(error)
    }
  }

  async remove(id: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC sp_DEPARTAMENTO_BAJA @ID_DEPARTAMENTO = @0`,
        [id]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
        return { 
          message: spResult.Message, 
          id: spResult.ID_DEPARTAMENTO 
        };
      }
      
      if (spResult && spResult.Success === 0) {
        return { 
          message: spResult.Message, 
          id: spResult.ID_DEPARTAMENTO 
        };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado al borrar departamento.');

    } catch (error) {
      handleDbError(error)
    }
  }
}
