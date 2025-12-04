import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { StorageService } from 'src/storage/storage.service';
import { Repository } from 'typeorm';
import { PlantillasModule } from './entities/plantillas-module.entity';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlantillasModuleService {
  constructor(@InjectRepository(PlantillasModule)
    private readonly plantillasModuleRepository: Repository<PlantillasModule>,
    private storageService: StorageService,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  async findAll(): Promise<PlantillasModule[]> {
    try {
      return this.plantillasModuleRepository.find({
        order: {
          FECHA_CREACION: 'DESC',
        }
      });
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number): Promise<PlantillasModule> {
    try {
      const plantilla = await this.plantillasModuleRepository.findOne({
        where: { ID_PLANTILLA: id },
      });

      if (!plantilla) {
        throw new NotFoundException(`Plantilla con ID ${id} no encontrada`);
      }

      return plantilla;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }

  }

  async findActiva(): Promise<PlantillasModule | null> {
    try {
    return this.plantillasModuleRepository.findOne({
      where: {
        ACTIVO: true,
        ESTADO: 'ACTIVO',
      },
    });
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async upload(
    file: Express.Multer.File,
    data: {
      NOMBRE_DISPLAY: string;
      DESCRIPCION?: string;
      NOTAS?: string;
      CREADO_POR: string;
    },
  ): Promise<PlantillasModule> {
    try {
      const tipoDocumento = this.getTipoDocumento(file.mimetype);
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      
      const nombreBase = this.sanitizarNombre(
        data.NOMBRE_DISPLAY || file.originalname.replace(ext, '')
      );
      
      const nombreArchivo = `plantilla_examen_${nombreBase}_${timestamp}${ext}`;
      
      const url = await this.storageService.uploadFileWithName(
        file,
        `capacitaciones/plantillas-documentos/${nombreArchivo}`,
      );
      
      const plantilla = this.plantillasModuleRepository.create({
        NOMBRE_ARCHIVO: file.originalname,
        NOMBRE_DISPLAY: data.NOMBRE_DISPLAY,
        DESCRIPCION: data.DESCRIPCION,
        TIPO_DOCUMENTO: tipoDocumento,
        URL_ARCHIVO: url,
        TAMANIO_BYTES: file.size,
        NOTAS: data.NOTAS,
        CREADO_POR: data.CREADO_POR,
        VERSION: 1,
        ESTADO: 'BORRADOR',
        ACTIVO: false,
      });
      
      return this.plantillasModuleRepository.save(plantilla);
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(
    id: number,
    updateData: {
      NOMBRE_DISPLAY?: string;
      DESCRIPCION?: string;
      NOTAS?: string;
      MODIFICADO_POR: string;
    },
  ): Promise<PlantillasModule> {
      try {
      const plantilla = await this.findOne(id);

/*       if (plantilla.ACTIVO && plantilla.ESTADO === 'ACTIVO') {
        throw new BadRequestException(
          'No se puede editar una plantilla predeterminada. Desactívala primero.',
        );
      }
 */
      Object.assign(plantilla, {
        ...updateData,
        FECHA_MODIFICACION: new Date(),
      });

      return this.plantillasModuleRepository.save(plantilla);
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async replace(
    id: number,
    file: Express.Multer.File,
    data: {
      NOMBRE_DISPLAY?: string;
      DESCRIPCION?: string;
      NOTAS?: string;
      MODIFICADO_POR: string;
    },
  ): Promise<PlantillasModule> {
    const plantilla = await this.findOne(id);

    try {
      // Eliminar archivo anterior de R2
      await this.storageService.deleteFile(plantilla.URL_ARCHIVO);

      // Subir nuevo archivo
      const tipoDocumento = this.getTipoDocumento(file.mimetype);
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);

      const nombreBase = this.sanitizarNombre(
        data.NOMBRE_DISPLAY || file.originalname.replace(ext, '')
      );
      
      const nombreArchivo = `plantilla_examen_${nombreBase}_${timestamp}${ext}`;
      
      const url = await this.storageService.uploadFileWithName(
        file,
        `capacitaciones/plantillas-documentos/${nombreArchivo}`,
      );

      // Actualizar registro
      plantilla.NOMBRE_ARCHIVO = file.originalname;
      plantilla.TIPO_DOCUMENTO = tipoDocumento;
      plantilla.URL_ARCHIVO = url;
      plantilla.TAMANIO_BYTES = file.size;
      plantilla.VERSION = plantilla.VERSION + 1;
      plantilla.FECHA_MODIFICACION = new Date();
      plantilla.MODIFICADO_POR = data.MODIFICADO_POR;

      if (data.NOMBRE_DISPLAY) plantilla.NOMBRE_DISPLAY = data.NOMBRE_DISPLAY;
      if (data.DESCRIPCION) plantilla.DESCRIPCION = data.DESCRIPCION;
      if (data.NOTAS) plantilla.NOTAS = data.NOTAS;

      return this.plantillasModuleRepository.save(plantilla);
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async activar(id: number, modificadoPor: string): Promise<PlantillasModule> {
    try {
      const plantilla = await this.findOne(id);

      if (plantilla.ESTADO === 'OBSOLETO') {
        throw new BadRequestException(
          'No se puede activar una plantilla obsoleta',
        );
      }

      plantilla.ACTIVO = true;
      plantilla.ESTADO = 'ACTIVO';
      plantilla.MODIFICADO_POR = modificadoPor;
      plantilla.FECHA_MODIFICACION = new Date();

      return this.plantillasModuleRepository.save(plantilla);
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async cambiarEstado(
    id: number,
    nuevoEstado: 'BORRADOR' | 'ACTIVO' | 'OBSOLETO',
    modificadoPor: string,
  ): Promise<PlantillasModule> {
    try {
      const plantilla = await this.findOne(id);

      if (nuevoEstado === 'ACTIVO' && plantilla.ACTIVO) {
        return this.activar(id, modificadoPor);
      }

      plantilla.ESTADO = nuevoEstado;
      plantilla.MODIFICADO_POR = modificadoPor;
      plantilla.FECHA_MODIFICACION = new Date();

      if (nuevoEstado === 'OBSOLETO') {
        plantilla.ACTIVO = false;
      }

      return this.plantillasModuleRepository.save(plantilla);
    } catch (error) {
      this.databaseErrorService.handle(error);
    }

  }

  async remove(id: number): Promise<void> {
    const plantilla = await this.findOne(id);

    if (plantilla.ACTIVO && plantilla.ESTADO === 'ACTIVO') {
      throw new BadRequestException(
        'No se puede eliminar la plantilla activa. Desactívala primero.',
      );
    }

    try {
      await this.storageService.deleteFile(plantilla.URL_ARCHIVO);

      await this.plantillasModuleRepository.remove(plantilla);
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      throw new InternalServerErrorException('Error al eliminar la plantilla');
    }
  }

  private getTipoDocumento(mimetype: string): 'PDF' | 'DOCX' | 'DOC' {
    const mimeMap = {
      'application/pdf': 'PDF' as const,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'DOCX' as const,
      'application/msword': 'DOC' as const,
    };

    return mimeMap[mimetype] || 'PDF';
  }

  async descargarPlantilla(id: number) {
    try {
      const result = await this.findOne(id)

      if (!result) {
        throw new NotFoundException('Registro de plantilla no encontrada');
      }

      const urlPlantilla = result.URL_ARCHIVO;

      if (!urlPlantilla) {
        throw new NotFoundException('No existe enlace para esta plantilla');
      }

      const signedUrl = await this.storageService.getSignedDownloadUrl(
        urlPlantilla,
        3600,
      );

      return {
        success: true,
        message: 'URL de descarga generada exitosamente',
        url: signedUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async descargarPlantillaPredeterminada() {
    try {
      const result = await this.findActiva()

      if (!result) {
        throw new NotFoundException('Registro de plantilla predeterminada no encontrada');
      }

      const urlPlantilla = result.URL_ARCHIVO;


      if (!urlPlantilla) {
        throw new NotFoundException('No existe enlace para esta plantilla');
      }

      const signedUrl = await this.storageService.getSignedDownloadUrl(
        urlPlantilla,
        3600,
      );

      return {
        success: true,
        message: 'URL de descarga generada exitosamente',
        url: signedUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  private sanitizarNombre(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);
  }

}
