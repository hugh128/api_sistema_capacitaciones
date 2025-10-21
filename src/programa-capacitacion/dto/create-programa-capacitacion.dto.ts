import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { CreateProgramaDetalleDto } from '../../programa-detalle/dto/create-programa-detalle.dto';

export class CreateProgramaCapacitacionDto {
  @IsString()
  @IsNotEmpty()
  NOMBRE: string;

  @IsOptional()
  @IsString()
  DESCRIPCION?: string;

  @IsString()
  @IsNotEmpty()
  TIPO: string;

  @IsNumber()
  @IsNotEmpty()
  PERIODO: number;

  @IsOptional()
  ESTADO?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramaDetalleDto)
  PROGRAMA_DETALLES: CreateProgramaDetalleDto[];
}
