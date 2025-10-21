import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaCapacitacionDto } from './create-programa-capacitacion.dto';

export class UpdateProgramaCapacitacionDto extends PartialType(CreateProgramaCapacitacionDto) {}
