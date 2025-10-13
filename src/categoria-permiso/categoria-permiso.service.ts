import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaPermisoDto } from './dto/create-categoria-permiso.dto';
import { UpdateCategoriaPermisoDto } from './dto/update-categoria-permiso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaPermiso } from './entities/categoria-permiso.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class CategoriaPermisoService {

  constructor(@InjectRepository(CategoriaPermiso)
    private categoriaPermisoRepository: Repository<CategoriaPermiso>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  async create(createCategoriaPermisoDto: CreateCategoriaPermisoDto) {
    try {
      
      const { CLAVE, NOMBRE, DESCRIPCION } = createCategoriaPermisoDto

      const result = await this.entityManager.query(
        `EXEC sp_CATEGORIA_PERMISO_ALTA
          @CLAVE = @0,
          @NOMBRE = @1,
          @DESCRIPCION = @2`,
        [
          CLAVE,
          NOMBRE,
          DESCRIPCION
        ]
      );

      if (result && result.length > 0 && result[0].ID_CATEGORIA !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID de la categoria.');
      }

    } catch (error) {
      this.databaseErrorService.handle(error); 
    }
  }

  async findAll() {
    try {
      return await this.categoriaPermisoRepository.find();
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number) {
    try {
      const categoria = await this.categoriaPermisoRepository.findOne({
        where: {
          ID_CATEGORIA: id
        }
      })

      if (!categoria) {
        throw new NotFoundException(`Categoria con ID ${id} no encontrada.`);
      }

      return categoria
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(id: number, updateCategoriaPermisoDto: UpdateCategoriaPermisoDto) {
    try {
      
      const { NOMBRE, CLAVE, DESCRIPCION } = updateCategoriaPermisoDto;

      const result = await this.entityManager.query(
        `EXEC sp_CATEGORIA_PERMISO_ACTUALIZAR
          @ID_CATEGORIA = @0,
          @CLAVE = @1,
          @NOMBRE = @2,
          @DESCRIPCION=@3`,
        [
          id,
          CLAVE,
          NOMBRE,
          DESCRIPCION
        ]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
        return {
          message: spResult.Message,
          id: spResult.ID_CATEGORIA
        };
      }
      
      if (spResult && spResult.Success === 0) {
        return {
          message: spResult.Message,
          id: spResult.ID_CATEGORIA
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
        `EXEC sp_CATEGORIA_PERMISO_ELIMINAR @ID_CATEGORIA = @0`,
        [id]
      );

      const spResult = result[0];

      return { message: spResult.Message, id: id };

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}
