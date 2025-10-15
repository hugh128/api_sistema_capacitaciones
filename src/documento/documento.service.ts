import { Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class DocumentoService {
  constructor(@InjectRepository(Documento)
  private documentoRepository: Repository<Documento>,
  private readonly entityManager: EntityManager,
  private readonly databaseErrorService: DatabaseErrorService
  ) {}

  async create(createDocumentoDto: CreateDocumentoDto) {
    try{
      const { CODIGO,TIPO_DOCUMENTO,NOMBRE_DOCUMENTO,APROBACION,ESTATUS } = createDocumentoDto;

      const result = await this.entityManager.query(
        'EXEC sp_DOCUMENTO_ALTA @CODIGO = @0, @TIPO_DOCUMENTO = @1, @NOMBRE_DOCUMENTO = @2, @APROBACION = @3, @ESTATUS = @4',
        [CODIGO, TIPO_DOCUMENTO, NOMBRE_DOCUMENTO, APROBACION, ESTATUS] 
      );
      if(result && result.length > 0 && result[0].ID_DOCUMENTO !== undefined){
        return result;
      }else {
        throw new Error('El procedimiento almacenado no devolvió el ID del usuario.');
      }

    }catch(error){
      this.databaseErrorService.handle(error)
    }
  }

  async findAll(): Promise<Documento[] | []> {
    try {
      return this.documentoRepository.find({
        relations: {
          DOCUMENTOS_ASOCIADOS: true
        }
      });
    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }

  async findOne(id: number): Promise<Documento | null>   {
    try {
      const result = await this.documentoRepository.findOne({
        where: { ID_DOCUMENTO: id }
      });
      if (!result) return null
      return result
    } catch (error) {
      this.databaseErrorService.handle(error)
    }
  }
  async update(id: number, updateDocumentoDto: UpdateDocumentoDto) {
    try {
      const { CODIGO, TIPO_DOCUMENTO, NOMBRE_DOCUMENTO, APROBACION, ESTATUS } = updateDocumentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_ACTUALIZAR
          @ID_DOCUMENTO = @0,
          @CODIGO = @1,
          @TIPO_DOCUMENTO = @2,
          @NOMBRE_DOCUMENTO = @3,
          @APROBACION = @4,
          @ESTATUS = @5`,
        [id, CODIGO, TIPO_DOCUMENTO, NOMBRE_DOCUMENTO, APROBACION, ESTATUS],
      );

      return {
        message: 'Documento actualizado correctamente',
        data: result[0] ?? null,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_BAJA @ID_DOCUMENTO = @0`,
        [id],
      );

      return {
        message: 'Documento eliminado (borrado lógico) correctamente',
        data: result[0] ?? null,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}
