import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoPlanDto } from './create-documento-plan.dto';

export class UpdateDocumentoPlanDto extends PartialType(CreateDocumentoPlanDto) {}
