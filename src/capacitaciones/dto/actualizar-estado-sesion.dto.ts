import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarEstadoSesionDto {
  @IsInt()
  @Type(() => Number)
  idSesion: number;

  @IsString()
  idCapacitador: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
