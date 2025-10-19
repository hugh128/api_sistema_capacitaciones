import { IsInt, IsNotEmpty } from "class-validator";

export class CreatePlanPuestoDto {
  @IsInt()
  @IsNotEmpty()
  ID_PUESTO: number;
}
