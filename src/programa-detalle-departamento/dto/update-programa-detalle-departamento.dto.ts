import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaDetalleDepartamentoDto } from './create-programa-detalle-departamento.dto';

export class UpdateProgramaDetalleDepartamentoDto extends PartialType(CreateProgramaDetalleDepartamentoDto) {}
