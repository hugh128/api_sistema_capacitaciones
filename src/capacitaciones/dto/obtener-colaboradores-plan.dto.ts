import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ObtenerColaboradoresPlanDto {
  @IsInt()
  @Type(() => Number)
  idPlan: number;
}
