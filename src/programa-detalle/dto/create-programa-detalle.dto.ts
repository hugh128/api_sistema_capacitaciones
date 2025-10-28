import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
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
  APLICA_TODOS_COLABORADORES?: boolean;

  @IsOptional()
  APLICA_DIPLOMA?: boolean;

  @IsOptional()
  @IsNumber()
  MES_PROGRAMADO?: number;

  @IsOptional()
  ESTADO?: string;

  @IsOptional()
  @IsNumber()
  PROGRAMA_ID: number;

  @IsInt({ each: true })
  @IsOptional()
  @ArrayUnique()
  DEPARTAMENTOS_IDS: number[];

  @IsInt({ each: true })
  @IsOptional()
  @ArrayUnique()
  PUESTOS_IDS: number[];
}
