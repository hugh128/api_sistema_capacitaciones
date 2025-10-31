import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarEstadoCapacitacionDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;

  @IsString()
  nuevoEstado: string; // 'CREADA', 'PENDIENTE_ASIGNACION', 'ASIGNADA', etc.

  @IsOptional()
  @IsString()
  observaciones?: string;
}
