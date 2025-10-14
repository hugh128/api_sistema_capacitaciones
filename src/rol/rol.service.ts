import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class RolService {

  constructor(@InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  private getIdsString(ids: (number | string)[]): string {
    return ids.map(id => String(id)).join(',');
  }

  async create(createRolDto: CreateRolDto) {
    const { NOMBRE, DESCRIPCION, ESTADO, ID_PERMISOS } = createRolDto;
    
    return this.entityManager.transaction(async manager => {
      try {
        const rolResult = await manager.query(
          `EXEC sp_ROL_ALTA
            @NOMBRE = @0,
            @DESCRIPCION = @1,
            @ESTADO = @2`,
          [
            NOMBRE,
            DESCRIPCION,
            ESTADO
          ]
        );

        const rolId = rolResult[0].ID_ROL;

        if (ID_PERMISOS && ID_PERMISOS.length > 0) {
          const permisosString = this.getIdsString(ID_PERMISOS);
          await manager.query(
            `EXEC sp_ROL_PERMISO_SINCRONIZAR
              @ROL_ID = @0,
              @PERMISO_IDS_STRING = @1`,
            [
              rolId,
              permisosString
            ]
          );
        }
        
        return rolId;

      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  async findAll() {
    try {
      const roles = await this.rolRepository.find({
        relations: {
          ROL_PERMISOS: {
            PERMISO: true,
          }
        }
      });

    return roles.map(rol => ({
      ID_ROL: rol.ID_ROL,
      NOMBRE: rol.NOMBRE,
      DESCRIPCION: rol.DESCRIPCION,
      ESTADO: rol.ESTADO,
      
      ROL_PERMISOS: rol.ROL_PERMISOS.map(rolPermiso => {
        const permiso = rolPermiso.PERMISO;
        return {
          ID_PERMISO: permiso.ID_PERMISO,
          CLAVE: permiso.CLAVE,
          NOMBRE: permiso.NOMBRE,
          DESCRIPCION: permiso.DESCRIPCION,
          CATEGORIA_ID: permiso.CATEGORIA_ID
        };
      }),
    }));
      
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number) {
    try {
      const rol = await this.rolRepository.findOne({
        where: {
          ID_ROL: id,
        }
      })

      if (!rol) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
      }

      return rol
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(id: number, updateRolDto: UpdateRolDto) {

    const { NOMBRE, DESCRIPCION, ESTADO, ID_PERMISOS } = updateRolDto;
    
    return this.entityManager.transaction(async manager => {
      try {
        const rolData = await manager.query(
          `EXEC sp_ROL_ACTUALIZAR
            @ID_ROL = @0,
            @NOMBRE = @1,
            @DESCRIPCION = @2,
            @ESTADO=@3`,
          [
            id,
            NOMBRE,
            DESCRIPCION,
            ESTADO
          ]
        );
        
        const spResult = rolData[0];
        if (spResult && spResult.Success === 0) {
            throw new ConflictException(spResult.Message);
        }
        
        if (ID_PERMISOS !== undefined) {
          const permisosString = this.getIdsString(ID_PERMISOS);
          const syncResult = await manager.query(
            `EXEC sp_ROL_PERMISO_SINCRONIZAR @ROL_ID=@0, @PERMISO_IDS_STRING=@1`,
            [id, permisosString]
          );
          
          if (syncResult && syncResult[0].Success === 0) {
            const resultObject = syncResult[0];
            const errorMessage = resultObject.Message as string; 
            throw new Error(errorMessage); 
          }
        }
        
        return { message: 'Rol y permisos actualizados.', id: id };

      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  async remove(id: number) {
    try {
      
      const result = await this.entityManager.query(
        `EXEC sp_ROL_BAJA @ID_ROL = @0`,
        [id]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
        return { 
          message: spResult.Message, 
          id: spResult.ID_ROL 
        };
      }
      
      if (spResult && spResult.Success === 0) {
        return { 
          message: spResult.Message, 
          id: spResult.ID_ROL 
        };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado al borrar rol.');

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}
