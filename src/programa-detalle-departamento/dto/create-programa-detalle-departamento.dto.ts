import { IsInt, IsNotEmpty } from "class-validator";

export class CreateProgramaDetalleDepartamentoDto {
  @IsInt()
  @IsNotEmpty()
  ID_DEPARTAMENTO: number;
}
