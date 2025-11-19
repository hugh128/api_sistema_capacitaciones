import { Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class DocumentoService {
  constructor(@InjectRepository(Documento)
  private documentoRepository: Repository<Documento>,
  private readonly entityManager: EntityManager,
  private readonly databaseErrorService: DatabaseErrorService,
  private readonly dataSource: DataSource,
  ) {}

  async create(createDocumentoDto: CreateDocumentoDto) {
    try{
      const { CODIGO, TIPO_DOCUMENTO, NOMBRE_DOCUMENTO, APROBACION, VERSION, ESTATUS, DEPARTAMENTO_CODIGO } = createDocumentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_ALTA
          @CODIGO = @0,
          @TIPO_DOCUMENTO = @1,
          @NOMBRE_DOCUMENTO = @2,
          @APROBACION = @3,
          @VERSION = @4,
          @ESTATUS = @5,
          @DEPARTAMENTO_CODIGO = @6`,
        [
          CODIGO,
          TIPO_DOCUMENTO,
          NOMBRE_DOCUMENTO,
          APROBACION,
          VERSION,
          ESTATUS,
          DEPARTAMENTO_CODIGO
        ] 
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
      const { CODIGO, TIPO_DOCUMENTO, NOMBRE_DOCUMENTO, APROBACION, VERSION, ESTATUS, DEPARTAMENTO_CODIGO } = updateDocumentoDto;

      const result = await this.entityManager.query(
        `EXEC sp_DOCUMENTO_ACTUALIZAR
          @ID_DOCUMENTO = @0,
          @CODIGO = @1,
          @TIPO_DOCUMENTO = @2,
          @NOMBRE_DOCUMENTO = @3,
          @APROBACION = @4,
          @VERSION = @5,
          @ESTATUS = @6,
          @DEPARTAMENTO_CODIGO = @7`,
        [
          id,
          CODIGO,
          TIPO_DOCUMENTO,
          NOMBRE_DOCUMENTO,
          APROBACION,
          VERSION,
          ESTATUS,
          DEPARTAMENTO_CODIGO
        ],
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

  async recapacitarPorNuevaVersionDocumento(idDocumento: number, nuevaVersion: number, usuario: string) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_DOCUMENTO', idDocumento)
        .input('NUEVA_VERSION', nuevaVersion)
        .input('USUARIO', usuario)
        .execute('SP_RECAPACITAR_POR_NUEVA_VERSION ');

      console.log(result);

      return {
        RESUMEN: result.recordsets[0] || [],
        DETALLE_RECAPACITACION: result.recordsets[1] || [],
      };

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

}
