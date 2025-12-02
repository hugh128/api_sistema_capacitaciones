import { IsOptional, IsDateString } from 'class-validator';

export class ReporteFiltrosDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
