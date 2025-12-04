import { Type } from "class-transformer";
import { ArrayUnique, IsInt, IsOptional, IsString } from "class-validator";

export class CambiarPlanCapacitacionDto {
  @IsInt()
  @Type(() => Number)
  ID_COLABORADOR: number;

  @IsInt()
  @Type(() => Number)
  NUEVO_DEPARTAMENTO_ID: number;

  @IsInt()
  @Type(() => Number)
  NUEVO_PUESTO_ID: number;

  @IsInt({ each: true })
  @ArrayUnique()
  @IsOptional()
  IDS_DOCUMENTOS_MIGRAR: number[];

  @IsString()
  @IsOptional()
  USUARIO: string;
}
