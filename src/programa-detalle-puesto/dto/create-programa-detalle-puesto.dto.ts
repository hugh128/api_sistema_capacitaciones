import { IsInt, IsNotEmpty } from "class-validator";

export class CreateProgramaDetallePuestoDto {
  @IsInt()
  @IsNotEmpty()
  ID_PUESTO: number;
}
