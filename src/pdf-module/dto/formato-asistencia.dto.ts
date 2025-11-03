import { IsString, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentoPadreDto {
  @IsString()
  codigoDocumento: string;

  @IsString()
  versionDocumento: string;
}

export class DocumentoAsociadoDto {
  @IsString()
  codigoDocumento: string;
}

export class ColaboradorCapacitadoDto {
  @IsString()
  nombre: string;
}

export class FormatoAsistenciaFrontendDto {
  @IsString()
  fechaEmision: string;

  @IsString()
  fechaProximaRevision: string;

  @IsString()
  tipoCapacitacion: string;

  @Type(() => DocumentoPadreDto)
  documentoPadre: DocumentoPadreDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentoAsociadoDto)
  documentosAsociados: DocumentoAsociadoDto[];

  @IsString()
  grupoObjetivo: string;

  @IsString()
  nombreCapacitacion: string;

  @IsString()
  objetivoCapacitacion: string;

  @IsString()
  nombreFacilitador: string;

  @IsString()
  fechaCapacitacion: string;

  @IsString()
  horario: string;

  @IsString()
  instruccion: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColaboradorCapacitadoDto)
  capacitados: ColaboradorCapacitadoDto[];
}
