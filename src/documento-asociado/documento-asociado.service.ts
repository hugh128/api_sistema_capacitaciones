import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DocumentoAsociado } from './entities/documento-asociado.entity';
import { CreateDocumentoAsociadoDto } from './dto/create-documento-asociado.dto';
import { UpdateDocumentoAsociadoDto } from './dto/update-documento-asociado.dto';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class DocumentoAsociadoService {
  constructor(
    @InjectRepository(DocumentoAsociado)
    private readonly documentoAsociadoRepository: Repository<DocumentoAsociado>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
  ) {}

  // CREATE
  async create(createDto: CreateDocumentoAsociadoDto) {
    try {
      const { CODIGO, NOMBRE_DOCUMENTO, DOCUMENTO_ID, ESTATUS } = createDto;

      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_ASOCIADO_ALTA 
          @CODIGO = @0, 
          @NOMBRE_DOCUMENTO = @1, 
          @DOCUMENTO_ID = @2,
          @ESTATUS = @3`,
        [CODIGO, NOMBRE_DOCUMENTO, DOCUMENTO_ID, ESTATUS ?? 1],
      );

      if (result?.length && result[0]?.ID_DOC_ASOCIADO) {
        return {
          message: 'Documento asociado creado correctamente.',
          data: result[0],
        };
      } else {
        throw new Error('El procedimiento no devolvió un ID válido.');
      }
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  // READ ALL 

  async findAll(): Promise<DocumentoAsociado[]> {
    try {
      const result = await this.documentoAsociadoRepository.find({
        relations:{ DOCUMENTO_PADRE: true }
      });
      return result;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  // READ ONE
  async findOne(id: number): Promise<DocumentoAsociado | null> {
    try {
      const result = await this.documentoAsociadoRepository.findOne({
        where: { ID_DOC_ASOCIADO: id },
        relations: ['DOCUMENTO'],
      });
      return result;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  // UPDATE 
  async update(id: number, updateDto: UpdateDocumentoAsociadoDto) {
    try {
      const { CODIGO, NOMBRE_DOCUMENTO, ESTATUS } = updateDto;

      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_ASOCIADO_ACTUALIZAR 
          @ID_DOC_ASOCIADO = @0,
          @CODIGO = @1,
          @NOMBRE_DOCUMENTO = @2,
          @ESTATUS = @3`,
        [id, CODIGO, NOMBRE_DOCUMENTO, ESTATUS ?? 1],
      );

      return {
        message: 'Documento asociado actualizado correctamente.',
        data: result[0] ?? null,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  // DELETE (borrado lógico) 
  async remove(id: number) {
    try {
      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_ASOCIADO_BAJA @ID_DOC_ASOCIADO = @0`,
        [id],
      );

      return {
        message: 'Documento asociado eliminado (borrado lógico).',
        data: result[0] ?? null,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }
}

