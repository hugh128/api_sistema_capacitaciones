import { IsInt, IsString, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class AplicarPlanDto {
  @IsInt()
  @Type(() => Number)
  idPlan: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un colaborador' })
  @IsInt({ each: true })
  @Type(() => Number)
  idsColaboradores: number[];

  @IsString()
  usuario: string;
}
