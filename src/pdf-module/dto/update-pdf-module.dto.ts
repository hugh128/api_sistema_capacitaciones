import { PartialType } from '@nestjs/mapped-types';
import { CreatePdfModuleDto } from './create-pdf-module.dto';

export class UpdatePdfModuleDto extends PartialType(CreatePdfModuleDto) {}
