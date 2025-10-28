import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaDetallePuestoDto } from './create-programa-detalle-puesto.dto';

export class UpdateProgramaDetallePuestoDto extends PartialType(CreateProgramaDetallePuestoDto) {}
