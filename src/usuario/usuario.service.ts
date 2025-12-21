import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { EntityManager, Repository } from 'typeorm';
import { HashingService } from 'src/common/hashing.service';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class UsuarioService {

  constructor(@InjectRepository(Usuario)
    private usuarioResposity: Repository<Usuario>,
    private readonly entityManager: EntityManager,
    private readonly hashingService: HashingService,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  private getIdsString(ids: (number | string)[]): string {
    return ids.map(id => String(id)).join(',');
  }


  async create(createUsuarioDto: CreateUsuarioDto) {
    const { PERSONA_ID, USERNAME, PASSWORD, ESTADO, USUARIO_ACCION_ID, ID_ROLES } = createUsuarioDto;
    
    const hashedPassword = await this.hashingService.hash(PASSWORD)

    return this.entityManager.transaction(async manager => {
      try {
        const usuarioResult = await manager.query(
          `EXEC sp_USUARIO_ALTA
            @PERSONA_ID = @0,
            @USERNAME = @1,
            @PASSWORD = @2,
            @ESTADO = @3,
            @USUARIO_ACCION_ID = @4`,
          [
            PERSONA_ID,
            USERNAME,
            hashedPassword,
            ESTADO,
            USUARIO_ACCION_ID
          ]
        );

        const newUsuarioId = usuarioResult[0].ID_USUARIO;

        if (!newUsuarioId) {
          throw new Error('El procedimiento almacenado no devolvió el ID del usuario.');
        }
        
        if (ID_ROLES && ID_ROLES.length > 0) {
          const rolesString = this.getIdsString(ID_ROLES);
          
          await manager.query(
            `EXEC sp_USUARIO_ROL_SINCRONIZAR
              @ID_USUARIO = @0,
              @ROLES_IDS_STRING = @1`,
            [
              newUsuarioId,
              rolesString
            ]
          );
        }
        
        return newUsuarioId;

      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  async findAll() {
    try {
      const usuarios = await this.usuarioResposity.find({
        relations: {
          PERSONA: true,
          USUARIO_ROLES: {
            ROL: {
              ROL_PERMISOS: {
                PERMISO: true,
              }
            }
          },
        },
        order: {
          USERNAME: 'ASC'
        }
      });

      if (usuarios.length === 0) return [];

      return usuarios.map(usuario => ({
        ID_USUARIO: usuario.ID_USUARIO,
        PERSONA_ID: usuario.PERSONA_ID,
        USERNAME: usuario.USERNAME,
        ESTADO: usuario.ESTADO,
        ULTIMO_ACCESO: usuario.ULTIMO_ACCESO,
        FECHA_CREACION: usuario.FECHA_CREACION,
        
        PERSONA: usuario.PERSONA,
        
        USUARIO_ROLES: usuario.USUARIO_ROLES.map(uRol => {
          const rol = uRol.ROL;
          
          const permisosAplanados = rol.ROL_PERMISOS.map(rPermiso => {
            const permiso = rPermiso.PERMISO;
            return {
              ID_PERMISO: permiso.ID_PERMISO,
              CLAVE: permiso.CLAVE,
              NOMBRE: permiso.NOMBRE,
              DESCRIPCION: permiso.DESCRIPCION,
              CATEGORIA_ID: permiso.CATEGORIA_ID,
            };
          });
            
          return {
            ID_ROL: rol.ID_ROL,
            NOMBRE: rol.NOMBRE,
            DESCRIPCION: rol.DESCRIPCION,
            ESTADO: rol.ESTADO,
            ROL_PERMISOS: permisosAplanados
          };
        })
      }));

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number): Promise<Usuario> {
    try {
      
      const usuario = await this.usuarioResposity.findOneBy({
        ID_USUARIO: id
      })

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }

      return usuario;
    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    try {
      return this.usuarioResposity.findOne({
        where: {
          USERNAME: username
        },
        relations: {
          PERSONA: {
            PUESTO: true,
            DEPARTAMENTO: true,
            EMPRESA: true,
          },
          USUARIO_ROLES: {
            ROL: {
              ROL_PERMISOS: {
                PERMISO: true,
              }
            }
          }
        }
      });
    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async updateData(id: number, updateUsuarioDto: UpdateUsuarioDto) {

    const { USERNAME, ESTADO, USUARIO_ACCION_ID, ID_ROLES } = updateUsuarioDto;

    return this.entityManager.transaction(async manager => {
      try {
        const usuarioData = await manager.query(
          `EXEC sp_USUARIO_ACTUALIZAR_DATOS
            @ID_USUARIO = @0,
            @USERNAME = @1,
            @ESTADO = @2,
            @USUARIO_ACCION_ID = @3`,
          [
            id,
            USERNAME,
            ESTADO,
            USUARIO_ACCION_ID
          ]
        );
        
        const spResult = usuarioData[0];

        if (spResult && spResult.Success === 0) {
          if (spResult.Message.includes('no encontrado')) {
            throw new NotFoundException(spResult.Message);
          }
          throw new ConflictException(spResult.Message);
        }
        
        if (ID_ROLES !== undefined) {
          const rolesString = this.getIdsString(ID_ROLES);
          
          const syncResult = await manager.query(
            `EXEC sp_USUARIO_ROL_SINCRONIZAR @ID_USUARIO = @0, @ROLES_IDS_STRING = @1`,
            [id, rolesString]
          );

          if (syncResult && syncResult[0].Success === 0) {
            const resultObject = syncResult[0];
            const errorMessage = resultObject.Message as string; 
            throw new Error(errorMessage); 
          }
        }
        
        return { message: 'Usuario y roles actualizados.', id: id };

      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    const { PASSWORD, USUARIO_ACCION_ID } = updatePasswordDto;
    
    const hashedPassword = await this.hashingService.hash(PASSWORD)

    try {
      const result = await this.entityManager.query(
        `EXEC sp_USUARIO_ACTUALIZAR_PASSWORD
          @ID_USUARIO = @0,
          @PASSWORD = @1,
          @USUARIO_ACCION_ID = @2`,
        [id, hashedPassword, USUARIO_ACCION_ID]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
        return {
          message: spResult.Message,
          id: spResult.ID_PERSONA
        };
      }
      
      if (spResult && spResult.Success === 0) {
        return {
          message: spResult.Message,
          id: spResult.ID_PERSONA
        };
      }

    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async remove(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { USUARIO_ACCION_ID } = updateUsuarioDto;

    try {
    const result = await this.entityManager.query(
      `EXEC sp_USUARIO_BAJA
       @ID_USUARIO = @0,
       @USUARIO_ACCION_ID = @1`,
      [id, USUARIO_ACCION_ID]
    );

    const spResult = result[0];

    if (spResult && spResult.Success === 1) {
      return {
        message: spResult.Message,
        id: spResult.ID_USUARIO
      };
    }
    
    if (spResult && spResult.Success === 0) {
      return {
        message: spResult.Message,
        id: spResult.ID_USUARIO
      };
    }

    throw new Error('El procedimiento almacenado devolvió un resultado inesperado al dar de baja al usuario.');
    
    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async obtenerCapacitadores() {
    try {
      const ROLE_NAME = 'Capacitador';

      const capacitadores = await this.usuarioResposity
        .createQueryBuilder('usuario')
        .innerJoin('usuario.USUARIO_ROLES', 'usuarioRol')
        .innerJoin('usuarioRol.ROL', 'rol')
        .innerJoin('usuario.PERSONA', 'persona')
        .where('rol.NOMBRE = :roleName', { roleName: ROLE_NAME })
        .andWhere('usuario.ESTADO = :estado', { estado: true })
        .select([
          'usuario.ID_USUARIO AS "ID_USUARIO"',
          'usuario.PERSONA_ID AS "PERSONA_ID"',
          'usuario.ESTADO AS "ESTADO"',
          'persona.NOMBRE AS "NOMBRE"',
          'persona.APELLIDO AS "APELLIDO"',
          'persona.CORREO AS "CORREO"',
        ])
        .getRawMany();

      return capacitadores;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

}
