// dtos/registrar-asistencia-masiva.dto.ts
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ColaboradorAsistenciaDto {
  @IsInt()
  idColaborador: number;

  @IsBoolean()
  @IsOptional()
  asistio: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  notaObtenida?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  archivoExamen?: string;

  @IsOptional()
  @IsString()
  archivoDiploma?: string;
}

export class RegistrarAsistenciaMasivaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColaboradorAsistenciaDto)
  colaboradores: ColaboradorAsistenciaDto[];
}