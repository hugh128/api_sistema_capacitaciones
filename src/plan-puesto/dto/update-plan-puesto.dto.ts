import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanPuestoDto } from './create-plan-puesto.dto';

export class UpdatePlanPuestoDto extends PartialType(CreatePlanPuestoDto) {}
