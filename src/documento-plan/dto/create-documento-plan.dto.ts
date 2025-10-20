import { IsInt, IsNotEmpty } from "class-validator";

export class CreateDocumentoPlanDto {
  @IsInt()
  @IsNotEmpty()
  ID_DOCUMENTO: number;
}
