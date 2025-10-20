import { ArrayUnique, IsInt, IsNotEmpty, IsOptional, IsString, } from "class-validator";

export class CreatePlanCapacitacionDto {
  @IsString()
  @IsNotEmpty()
  NOMBRE: string;

  @IsOptional()
  @IsString()
  DESCRIPCION: string;

  @IsString()
  @IsNotEmpty()
  TIPO: string;

  @IsInt()
  @IsNotEmpty()
  DEPARTAMENTO_ID: number;

  @IsNotEmpty()
  APLICA_TODOS_PUESTOS_DEP: boolean;

  @IsOptional()
  ESTADO?: boolean;

  @IsInt({ each: true })
  @ArrayUnique()
  ID_PUESTOS: number[];

  @IsInt({ each: true })
  @ArrayUnique()
  ID_DOCUMENTOS: number[];

}
