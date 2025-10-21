import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  IsNumber,
  IsInt,
  ArrayUnique,
} from 'class-validator';

export class CreateProgramaDetalleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  NOMBRE: string;

  @IsString()
  @IsNotEmpty()
  CATEGORIA_CAPACITACION: string;

  @IsString()
  @IsNotEmpty()
  TIPO_CAPACITACION: string;

  @IsOptional()
  APLICA_TODOS_DEPARTAMENTOS?: boolean;

  @IsOptional()
  @IsDateString()
  FECHA_PROGRAMADA?: string;

  @IsOptional()
  ESTADO?: string;

  @IsOptional()
  @IsNumber()
  PROGRAMA_ID: number;

  @IsInt({ each: true })
  @IsOptional()
  @ArrayUnique()
  DEPARTAMENTOS_IDS: number[];
}
