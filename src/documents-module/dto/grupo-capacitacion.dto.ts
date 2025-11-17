import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator"

export class GrupoCapacitacionDto {
  @IsString()
  @IsNotEmpty()
  departamentoCapacitacion: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CapacitacionInduccionDto)
  capacitaciones: CapacitacionInduccionDto[];
}

class CapacitacionInduccionDto {
  // Informacion capacitacion
  documento: string
  codigo: string
  version: number
  fechaEvaluacion?: string
  lectura?: string
  capacitacion?: string
  evaluacion?: string
  calificacion?: string
  estatus: string
}