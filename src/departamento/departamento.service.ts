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
	  const { CODIGO, NOMBRE, DESCRIPCION, ID_ENCARGADO, ESTADO, USUARIO_ACCION_ID } = createDepartamentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DEPARTAMENTO_ALTA 
          @CODIGO = @0,
          @NOMBRE = @1, 
          @DESCRIPCION = @2,
          @ID_ENCARGADO = @3,
          @ESTADO = @4,
          @USUARIO_ACCION_ID = @5`,
        [
          CODIGO,
          NOMBRE,
          DESCRIPCION,
          ID_ENCARGADO,
          ESTADO,
          USUARIO_ACCION_ID,
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
      return await this.departamentoRepository.find({
        relations: {
          ENCARGADO: true
        },
        order: {
          NOMBRE: 'ASC'
        }
      });
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
	  const { CODIGO, NOMBRE, DESCRIPCION, ID_ENCARGADO, ESTADO, USUARIO_ACCION_ID } = updateDepartamentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DEPARTAMENTO_ACTUALIZAR
            @ID_DEPARTAMENTO = @0,
            @CODIGO = @1,
            @NOMBRE = @2,
            @DESCRIPCION = @3,
            @ID_ENCARGADO = @4,
            @ESTADO = @5,
            @USUARIO_ACCION_ID = @6`,
        [
          id,
          CODIGO,
          NOMBRE,
          DESCRIPCION,
          ID_ENCARGADO,
          ESTADO,
          USUARIO_ACCION_ID
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

  async remove(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    const { USUARIO_ACCION_ID } = updateDepartamentoDto

    try {
      const result = await this.entityManager.query(
        `EXEC sp_DEPARTAMENTO_BAJA
          @ID_DEPARTAMENTO = @0,
          @USUARIO_ACCION_ID = @1`,
        [
          id,
          USUARIO_ACCION_ID,
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

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado al borrar departamento.');

    } catch (error) {
      handleDbError(error)
    }
  }
}
