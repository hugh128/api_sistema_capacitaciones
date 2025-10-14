import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class PermisoService {

  constructor(@InjectRepository(Permiso)
    private permisoRepository: Repository<Permiso>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  async create(createPermisoDto: CreatePermisoDto) {
    try {
      const { CLAVE, NOMBRE, DESCRIPCION, CATEGORIA_ID } = createPermisoDto

      const result = await this.entityManager.query(
        `EXEC sp_PERMISO_ALTA
          @CLAVE = @0,
          @NOMBRE = @1,
          @DESCRIPCION = @2,
          @CATEGORIA_ID = @3`,
        [
          CLAVE,
          NOMBRE,
          DESCRIPCION,
          CATEGORIA_ID
        ]
      );

      if (result && result.length > 0 && result[0].ID_PERMISO !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID del permiso.');
      }

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findAll() {
    try {
      return await this.permisoRepository.find({
        relations: {
          CATEGORIA: true
        }
      });
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number) {
    try {
      const permiso = await this.permisoRepository.findOne({
        where: {
          ID_PERMISO: id,
        }
      })

      if (!permiso) {
        throw new NotFoundException(`Permiso con ID ${id} no encontrado.`);
      }

      return permiso

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto) {
    try {
      
      const { CLAVE, NOMBRE, DESCRIPCION, CATEGORIA_ID } = updatePermisoDto;

      const result = await this.entityManager.query(
        `EXEC sp_PERMISO_ACTUALIZAR
          @ID_PERMISO = @0,
          @CLAVE = @1,
          @NOMBRE = @2,
          @DESCRIPCION = @3,
          @CATEGORIA_ID = @4`,
        [
          id,
          CLAVE,
          NOMBRE,
          DESCRIPCION,
          CATEGORIA_ID
        ]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
        return {
          message: spResult.Message,
          id: spResult.ID_PERMISO
        };
      }
      
      if (spResult && spResult.Success === 0) {
        return {
          message: spResult.Message,
          id: spResult.ID_PERMISO
        };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado.');

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC sp_PERMISO_ELIMINAR @ID_PERMISO = @0`,
        [id]
      );

      const spResult = result[0];
      return { message: spResult.Message, id: id };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}
