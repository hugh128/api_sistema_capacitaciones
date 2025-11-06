import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentsModuleDto } from './create-documents-module.dto';

export class UpdateDocumentsModuleDto extends PartialType(CreateDocumentsModuleDto) {}
