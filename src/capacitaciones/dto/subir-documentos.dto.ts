import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubirListaAsistenciaDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;
}

export class SubirExamenDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;

  @IsInt()
  @Type(() => Number)
  idColaborador: number;
}

export class SubirDiplomaDto {
  @IsInt()
  @Type(() => Number)
  idCapacitacion: number;

  @IsInt()
  @Type(() => Number)
  idColaborador: number;
}
