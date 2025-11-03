import {
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrarListadoAsistenciaDto {
  @IsInt()
  @Type(() => Number)
  idCapacitador: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}