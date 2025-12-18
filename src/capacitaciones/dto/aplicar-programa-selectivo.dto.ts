import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";

class DetalleAsignacionDto {
  idColaborador: number;
  detalles: number[];
}

export class AplicarProgramaSelectivoDto {
  @IsNumber()
  idPrograma: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleAsignacionDto)
  asignaciones: DetalleAsignacionDto[]; 

  @IsString()
  usuario: string;
}
