import { PartialType } from '@nestjs/mapped-types';
import { CreateCapacitacioneDto } from './create-capacitacione.dto';

export class UpdateCapacitacioneDto extends PartialType(CreateCapacitacioneDto) {}
