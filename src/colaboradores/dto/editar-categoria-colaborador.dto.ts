import { IsArray, IsNotEmpty, IsString, ArrayMinSize, IsInt } from 'class-validator';

export class EditarCategoriaColaboradorDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  usuario: string;
}
