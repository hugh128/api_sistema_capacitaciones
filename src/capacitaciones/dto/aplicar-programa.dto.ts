import {
  IsInt,
  IsString
} from 'class-validator';
import { Type } from 'class-transformer';

export class AplicarProgramaDto {
  @IsInt()
  @Type(() => Number)
  idPrograma: number;

  @IsString()
  usuario: string;
}
