import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.requireEnv('R2_ACCOUNT_ID');
    const accessKeyId = this.requireEnv('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.requireEnv('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.requireEnv('R2_BUCKET_NAME');
    this.publicUrl = this.requireEnv('R2_PUBLIC_URL');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private requireEnv(key: string): string {
    const value = this.configService.get<string>(key)
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`)
    }
    return value
  }

  /**
   * Sube un archivo a Cloudflare R2
   * @param file - Archivo a subir (Multer.File)
   * @param folder - Carpeta dentro del bucket (ej: 'capacitaciones/examenes')
   * @returns URL pública del archivo
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'capacitaciones',
  ): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Retornar URL pública
      const fileUrl = `${this.publicUrl}/${fileName}`;
      this.logger.log(`Archivo subido exitosamente: ${fileUrl}`);

      return fileUrl;
    } catch (error) {
      this.logger.error('Error al subir archivo a R2', error);
      throw new Error('Error al subir archivo a almacenamiento');
    }
  }

  /**
   * Sube múltiples archivos
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'capacitaciones',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Elimina un archivo de R2
   * @param fileUrl - URL completa del archivo
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraer el key del archivo de la URL
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Archivo eliminado exitosamente: ${key}`);
    } catch (error) {
      this.logger.error('Error al eliminar archivo de R2', error);
      throw new Error('Error al eliminar archivo');
    }
  }

  /**
   * Genera una URL firmada (signed URL) para descargar archivos privados
   * @param fileUrl - URL del archivo
   * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
   */
  async getSignedDownloadUrl(
    fileUrl: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error('Error al generar URL firmada', error);
      throw new Error('Error al generar URL de descarga');
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }


  /**
   * Genera una URL firmada con nombre de archivo personalizado para descarga
   * @param fileUrl - URL del archivo
   * @param fileName - Nombre sugerido para el archivo al descargar
   * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
   */
  async getSignedDownloadUrlWithFilename(
    fileUrl: string,
    fileName: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error('Error al generar URL firmada con nombre', error);
      throw new Error('Error al generar URL de descarga');
    }
  }

  /**
   * Genera múltiples URLs firmadas de una vez
   */
  async getMultipleSignedUrls(
    fileUrls: string[],
    expiresIn: number = 3600,
  ): Promise<string[]> {
    const promises = fileUrls.map((url) =>
      this.getSignedDownloadUrl(url, expiresIn),
    );
    return Promise.all(promises);
  }

  /**
   * Verifica si un archivo existe en R2
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const key = fileUrl.replace(`${this.publicUrl}/`, '');
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  
  /**
   * Genera una URL firmada para descargar un archivo usando su directorio y nombre.
   * Útil cuando el archivo es privado y no se tiene la URL completa, solo el path.
   * @param folder - Carpeta dentro del bucket (ej: 'documentos/2024')
   * @param fileName - Nombre exacto del archivo (ej: 'informe_q3.pdf')
   * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
   * @returns URL firmada para la descarga
   */
  async downloadFileByPath(
    folder: string,
    fileName: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const fileKey = `${folder}/${fileName}`;

      const fileUrlForInput = this.getPublicUrl(fileKey);

      const signedUrl = await this.getSignedDownloadUrlWithFilename(
        fileUrlForInput,
        fileName,
        expiresIn,
      );
      
      this.logger.log(`URL de descarga firmada generada para: ${fileKey}`);
      return signedUrl;
    } catch (error) {
      this.logger.error('Error al generar URL de descarga por path', error);
      throw new Error('Error al generar URL de descarga por path');
    }
  }

}
