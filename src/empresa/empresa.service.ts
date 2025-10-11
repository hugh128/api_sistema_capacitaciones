import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager  } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class EmpresaService {
  
  constructor(@InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<any> {
    try {
      const { NOMBRE, DIRECCION, NIT, TELEFONO, CORREO, ESTADO } = createEmpresaDto;

      const result = await this.entityManager.query(
        `EXEC sp_EMPRESA_ALTA
          @NOMBRE = @0,
          @DIRECCION = @1,
          @NIT = @2,
          @TELEFONO = @3,
          @CORREO = @4,
          @ESTADO = @5`,
        [
          NOMBRE,
          DIRECCION,
          NIT,
          TELEFONO,
          CORREO,
          ESTADO
        ]
      )

      if (result && result.length > 0 && result[0].ID_EMPRESA !== undefined) {
        return result;
      } else {
        throw new Error('El procedimiento almacenado no devolvió el ID de la empresa.');
      }

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  findAll() {
    try {
      return this.empresaRepository.find()
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number): Promise<Empresa> {
    try {
      const empresa = await this.empresaRepository.findOneBy({
        ID_EMPRESA: id
      })

      if (!empresa) {
         throw new NotFoundException(`Empresa con ID ${id} no encontrada.`);
      }

      return empresa;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<any> {
    try {
      const { NOMBRE, DIRECCION, NIT, TELEFONO, CORREO, ESTADO } = updateEmpresaDto

      const result = await this.entityManager.query(
        `EXEC sp_EMPRESA_ACTUALIZAR
          @ID_EMPRESA = @0,
          @NOMBRE = @1,
          @DIRECCION = @2,
          @NIT = @3,
          @TELEFONO = @4,
          @CORREO = @5,
          @ESTADO = @6`,
        [
          id,
          NOMBRE,
          DIRECCION,
          NIT,
          TELEFONO,
          CORREO,
          ESTADO
        ]
      )

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
          return { 
              message: spResult.Message, 
              id: spResult.ID_EMPRESA 
          };
      }
      
      if (spResult && spResult.Success === 0) {
          return { 
              message: spResult.Message, 
              id: spResult.ID_EMPRESA 
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
          `EXEC sp_EMPRESA_BAJA
            @ID_EMPRESA = @0`,
          [id]
      );

      const spResult = result[0];

      if (spResult && spResult.Success === 1) {
          return { 
              message: spResult.Message, 
              id: spResult.ID_EMPRESA 
          };
      }
      
      if (spResult && spResult.Success === 0) {
          return { 
              message: spResult.Message, 
              id: spResult.ID_EMPRESA 
          };
      }

      throw new Error('El procedimiento almacenado devolvió un resultado inesperado.');

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}
