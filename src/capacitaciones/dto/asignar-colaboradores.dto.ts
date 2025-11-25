import {
  IsInt,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  ArrayMinSize,
  IsDateString,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AsignarColaboradoresDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un colaborador' })
  @IsInt({ each: true })
  @Type(() => Number)
  idsColaboradores: number[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  capacitadorId?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Hora de inicio debe estar en formato HH:MM o HH:MM:SS',
  })
  horaInicio?: string; // Formato: "14:00:00" o "14:00"

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Hora de fin debe estar en formato HH:MM o HH:MM:SS',
  })
  horaFin?: string; // Formato: "16:30:00" o "16:30"

  @IsOptional()
  @IsString()
  tipoCapacitacion?: string; // 'TALLER', 'CURSO', 'CHARLA', 'OTRO'

  @IsOptional()
  @IsString()
  modalidad?: string; // 'INTERNA', 'EXTERNA'

  @IsOptional()
  @IsString()
  grupoObjetivo?: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  aplicaExamen?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  notaMinima?: number;

  @IsOptional()
  aplicaDiploma?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  nombreSesion: string;

  @IsOptional()
  @IsString()
  usuario: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  version: number;
}
