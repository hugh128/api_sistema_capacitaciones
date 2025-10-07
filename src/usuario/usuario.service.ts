import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      
      const { PERSONA_ID, USERNAME, PASSWORD, ESTADO } = createUsuarioDto;

      const hashedPassword = this.hashingService.hash(PASSWORD)
      
      const result = await this.entityManager.query(
        `EXEC sp_USUARIO_ALTA
          @PERSONA_ID = @0,
          @USERNAME = @1,
          @PASSWORD = @2,
          @ESTADO = @3`,
        [
          PERSONA_ID,
          USERNAME,
          hashedPassword,
          ESTADO
        ]
      );

      if (result && result.length > 0 && result[0].ID_USUARIO !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID del usuario.');
      }

    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async findAll(): Promise<Usuario[] | []> {
    try {
      const result = await this.usuarioResposity.find();

      if (result.length === 0) return []

      return result

    } catch (error) {
      this.databaseErrorService.handle(error)
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
      return this.usuarioResposity.findOneBy({ USERNAME: username });
    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async updateData(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const { USERNAME, ESTADO } = updateUsuarioDto;

      const result = await this.entityManager.query(
        `EXEC sp_USUARIO_ACTUALIZAR_DATOS
          @ID_USUARIO = @0,
          @USERNAME = @1,
          @ESTADO = @2`,
        [
          id,
          USERNAME,
          ESTADO
        ]
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

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado al actualizar al usuario.');

    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<any> {
    const { PASSWORD } = updatePasswordDto;
    
    const hashedPassword = this.hashingService.hash(PASSWORD)

    try {
      const result = await this.entityManager.query(
        `EXEC sp_USUARIO_ACTUALIZAR_PASSWORD
          @ID_USUARIO = @0,
          @PASSWORD = @1`,
        [id, hashedPassword]
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

  async remove(id: number) {
    try {

    const result = await this.entityManager.query(
      `EXEC sp_USUARIO_BAJA @ID_USUARIO = @0`,
      [id]
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
}
