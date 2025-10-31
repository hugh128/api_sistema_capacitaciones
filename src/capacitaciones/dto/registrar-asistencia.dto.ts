import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrarAsistenciaDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;

  @IsInt()
  @Type(() => Number)
  idColaborador: number;

  @IsBoolean()
  @Type(() => Boolean)
  asistio: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  nota?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RegistrarAsistenciaMasivaDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;

  asistencias: {
    idColaborador: number;
    asistio: boolean;
    nota?: number;
    observaciones?: string;
  }[];
}
