import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { RequestError } from 'mssql';

export function handleDbError(error: unknown): never {
  console.error('Database Error Captured:', error);

  // ============================================================
  // 🧩 CASO 1: Errores de SQL Server (mssql)
  // ============================================================
  if (error instanceof RequestError) {
    const sqlError = error as RequestError;
    const sqlErrorNumber = sqlError.number || 0;

    switch (sqlErrorNumber) {
      case 2627: // Unique constraint
      case 2601:
        throw new ConflictException(
          'Conflicto de datos: El registro que intenta crear ya existe (Restricción de Unicidad).'
        );

      case 547:
        throw new BadRequestException(
          'Datos inválidos: Referencia a un registro inexistente o imposibilidad de eliminar por datos relacionados.'
        );

      case 8114:
      case 8115:
        throw new BadRequestException(
          'Error de formato de datos: Uno de los valores proporcionados es inválido o excede el límite permitido.'
        );

      case 50000: // THROW personalizado desde el SP
        const spMessage = sqlError.message.replace('Error: ', '');
        throw new BadRequestException(spMessage);

      default:
        throw new InternalServerErrorException(
          `Error interno de base de datos (SQL Code: ${sqlErrorNumber}).`
        );
    }
  }

  // ============================================================
  // 🧩 CASO 2: Error lógico devuelto por procedimiento almacenado
  // ============================================================
  if (
    typeof error === 'object' &&
    error !== null &&
    'Success' in error &&
    (error as any).Success === 0
  ) {
    const message =
      (error as any).Message ||
      'Error lógico detectado en el procedimiento almacenado.';
    throw new BadRequestException(message);
  }

  // ============================================================
  // 🧩 CASO 3: Errores de conexión
  // ============================================================
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as { code: string }).code;

    if (errorCode === 'ETIMEOUT' || errorCode === 'EHOSTUNREACH') {
      throw new InternalServerErrorException(
        'Error de conexión a la base de datos: Tiempo de espera agotado o host inaccesible.'
      );
    }
  }

  // ============================================================
  // 🧩 CASO 4: Errores HTTP (ya formateados)
  // ============================================================
  if (error instanceof HttpException) {
    throw error;
  }

  // ============================================================
  // 🧩 CASO 5: Fallback genérico
  // ============================================================
  let finalMessage = 'Ocurrió un error de servidor inesperado.';
  if (error instanceof Error) {
    finalMessage = error.message;
  }

  throw new InternalServerErrorException(finalMessage);
}
