import { Controller, Get, Query, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Endpoint para generar una URL de descarga firmada de un archivo privado
   * URL de ejemplo: /storage/download?folder=informes/2024&filename=reporte_q4.pdf
   */
@Get('download')
  async downloadFile(
    @Query('folder') folder: string,
    @Query('filename') filename: string,
  ) {
    if (!folder || !filename) {
      throw new BadRequestException('Faltan parámetros. Se requiere "folder" y "filename".');
    }

    try {
      const signedUrl = await this.storageService.downloadFileByPath(
        folder,
        filename,
        1800, 
      );

      return { url: signedUrl, statusCode: HttpStatus.FOUND };
      
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al generar la URL de descarga o el archivo no existe.');
    }
  }
}
