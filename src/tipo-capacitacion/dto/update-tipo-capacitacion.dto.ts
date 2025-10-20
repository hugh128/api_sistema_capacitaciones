import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoCapacitacionDto } from './create-tipo-capacitacion.dto';

export class UpdateTipoCapacitacionDto extends PartialType(CreateTipoCapacitacionDto) {}
