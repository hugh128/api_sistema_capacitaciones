import { PartialType } from '@nestjs/mapped-types';
import { CreateReportsModuleDto } from './create-reports-module.dto';

export class UpdateReportsModuleDto extends PartialType(CreateReportsModuleDto) {}
