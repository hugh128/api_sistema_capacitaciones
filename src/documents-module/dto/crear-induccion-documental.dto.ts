import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { GrupoCapacitacionDto } from "./grupo-capacitacion.dto"

export class CrearInduccionDocumentalDto {
  // Información del colaborador
  @IsString()
  @IsNotEmpty()
  nombreColaborador: string

  @IsString()
  @IsNotEmpty()
  departamentoColaborador: string

  @IsString()
  @IsNotEmpty()
  cargo: string

  @IsString()
  @IsNotEmpty()
  jefeInmediatoNombre: string

  // Informacion capacitacion
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrupoCapacitacionDto)
  gruposCapacitacion: GrupoCapacitacionDto[];

  // Informacion complementaria
  @IsString()
  @IsOptional()
  fechaInicioInduccion: string

  @IsString()
  @IsOptional()
  fechaFinInduccion: string
}