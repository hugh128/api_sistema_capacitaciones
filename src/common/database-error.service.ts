import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { RequestError } from 'mssql';

@Injectable()
export class DatabaseErrorService {

  public handle(error: unknown): never {
    
    console.error('Database Error Captured:', error);

    if (error instanceof RequestError) {
      
      const sqlError = error as RequestError; 
      const sqlErrorNumber: number = sqlError.number || 0; 

      switch (sqlErrorNumber) {
        case 2627:
        case 2601:
          throw new ConflictException('Conflicto de datos: El registro que intenta crear ya existe (Restricción de Unicidad).');

        case 547:
          throw new BadRequestException('Datos inválidos: Referencia a un registro inexistente o imposibilidad de eliminar por datos relacionados.');

        case 8114:
        case 8115:
          throw new BadRequestException('Error de formato de datos: Uno de los valores proporcionados es inválido o excede el límite permitido.');

        case 50000:
          const spMessage = sqlError.message.replace('Error: ', ''); 
          throw new BadRequestException(spMessage);

        default:
          const defaultSqlMessage = `Error interno de base de datos (SQL Code: ${sqlErrorNumber}).`;
          throw new InternalServerErrorException(defaultSqlMessage);
      }
    } 
    
    if (error && typeof error === 'object' && ('code' in error)) {
      const errorCode = (error as { code: string }).code;

      if (errorCode === 'ETIMEOUT' || errorCode === 'EHOSTUNREACH') { 
          throw new InternalServerErrorException('Error de conexión a la base de datos: Tiempo de espera agotado.');
      }
    }
    
    if (error instanceof HttpException) {
        throw error;
    } 
    
    let finalMessage = 'Ocurrió un error de servidor inesperado.';
    if (error instanceof Error) {
        finalMessage = error.message;
    }

    throw new InternalServerErrorException(finalMessage);
  }
}
