import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { EntityManager, Repository } from 'typeorm';
import { handleDbError } from 'src/utils/database-error.util';

@Injectable()
export class PersonaService {

  constructor(@InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    private readonly entityManager: EntityManager
  ){}

  async create(createPersonaDto: CreatePersonaDto) {
    try {
      const { 
          NOMBRE, APELLIDO, CORREO, TELEFONO, DPI, FECHA_NACIMIENTO, 
          TIPO_PERSONA, FECHA_INGRESO, EMPRESA_ID, DEPARTAMENTO_ID, 
          PUESTO_ID, ESTADO = true 
      } = createPersonaDto;

      const result = await this.entityManager.query(
          `EXEC sp_PERSONA_ALTA
            @NOMBRE = @0,
            @APELLIDO = @1,
            @CORREO = @2,
            @TELEFONO = @3,
            @DPI = @4,
            @FECHA_NACIMIENTO = @5,
            @TIPO_PERSONA = @6,
            @FECHA_INGRESO = @7,
            @EMPRESA_ID = @8,
            @DEPARTAMENTO_ID = @9,
            @PUESTO_ID = @10,
            @ESTADO = @11`,
          [
            NOMBRE,
            APELLIDO,
            CORREO,
            TELEFONO,
            DPI,
            FECHA_NACIMIENTO,
            TIPO_PERSONA,
            FECHA_INGRESO,
            EMPRESA_ID,
            DEPARTAMENTO_ID,
            PUESTO_ID,
            ESTADO
          ]
      );

      if (result && result.length > 0 && result[0].ID_PERSONA !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID de la persona.');
      }

    } catch (error) {
      handleDbError(error);
    }
  }

  async findAll() {
    try {
      return await this.personaRepository.find({
        relations: {
          EMPRESA: true,
          DEPARTAMENTO: true,
          PUESTO: true
        },
        order: {
          NOMBRE: 'asc',
        }
      });
    } catch (error) {
      handleDbError(error)
    }
  }

  async findAllColaboradores() {
    try {
      return await this.personaRepository.find({
        relations: {
          EMPRESA: true,
          DEPARTAMENTO: true,
          PUESTO: true
        },
        order: {
          NOMBRE: 'asc',
        },
        where: {
          TIPO_PERSONA: 'INTERNO'
        }
      });
    } catch (error) {
      handleDbError(error)
    }
  }

  async findSinUsuarioYActivas() {
    try {
      return await this.personaRepository
        .createQueryBuilder('persona')
        .leftJoin('persona.USUARIO', 'usuario')
        .where('usuario.ID_USUARIO IS NULL')
        .andWhere('persona.ESTADO = :estado', { estado: 1 })
        .getMany();
    } catch (error) {
      handleDbError(error);
    }
  }

  async findOne(id: number) {
    try {
      const persona = await this.personaRepository.findOneBy({
        ID_PERSONA: id
      })

      if (!persona) {
         throw new NotFoundException(`Persona con ID ${id} no encontrado.`);
      }

      return persona;
    } catch (error) {
      handleDbError(error);
    }
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    try {

    const { 
      NOMBRE, APELLIDO, CORREO, TELEFONO, DPI, FECHA_NACIMIENTO, 
      TIPO_PERSONA, FECHA_INGRESO, EMPRESA_ID, DEPARTAMENTO_ID, 
      PUESTO_ID, ESTADO 
    } = updatePersonaDto;

    const result = await this.entityManager.query(
      `EXEC sp_PERSONA_ACTUALIZAR
        @ID_PERSONA = @0,
        @NOMBRE = @1,
        @APELLIDO = @2,
        @CORREO = @3,
        @TELEFONO = @4,
        @DPI = @5,
        @FECHA_NACIMIENTO = @6,
        @TIPO_PERSONA = @7,
        @FECHA_INGRESO = @8,
        @EMPRESA_ID = @9,
        @DEPARTAMENTO_ID = @10,
        @PUESTO_ID = @11,
        @ESTADO = @12`,
      [
        id,
        NOMBRE,
        APELLIDO,
        CORREO,
        TELEFONO,
        DPI,
        FECHA_NACIMIENTO,
        TIPO_PERSONA,
        FECHA_INGRESO,
        EMPRESA_ID,
        DEPARTAMENTO_ID,
        PUESTO_ID,
        ESTADO
      ]
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

    throw new Error('El procedimiento almacenado devolvió un resultado inesperado al actualizar a la persona.');

    } catch (error) {
      handleDbError(error);
    }
  }

  async remove(id: number) {
    try {
      
    const result = await this.entityManager.query(
        `EXEC sp_PERSONA_BAJA @ID_PERSONA = @0`,
        [id]
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

    throw new Error('El procedimiento almacenado devolvió un resultado inesperado al dar de baja a la persona.');

    } catch (error) {
      handleDbError(error);
    }
  }
}
