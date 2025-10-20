import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanCapacitacionDto } from './create-plan-capacitacion.dto';

export class UpdatePlanCapacitacionDto extends PartialType(CreatePlanCapacitacionDto) {}
