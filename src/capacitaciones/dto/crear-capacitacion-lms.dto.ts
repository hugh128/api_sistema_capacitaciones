import {
  IsString,
  IsInt,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
 
export class ColaboradorCapacitacionDto {
  @IsInt()
  idColaborador!: number;
}
 
export class CrearCapacitacionLmsDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
 
  @IsString()
  @IsNotEmpty()
  categoriaCapacitacion!: string;
 
  @IsString()
  @IsNotEmpty()
  tipoCapacitacion!: string;
 
  @IsBoolean()
  aplicaExamen!: boolean;
 
  @IsInt()
  @IsOptional()
  notaMinima?: number;
 
  @IsInt()
  programaId!: number;
 
  @IsInt()
  capacitadorId!: number;
 
  @IsString()
  @IsNotEmpty()
  fechaProgramada!: string;
 
  @IsString()
  @IsNotEmpty()
  modalidad!: string;
 
  @IsString()
  @IsNotEmpty()
  categoriaSesion!: string;
 
  @IsString()
  @IsNotEmpty()
  usuarioCreacion!: string;
 
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ColaboradorCapacitacionDto)
  colaboradores!: ColaboradorCapacitacionDto[];
}
