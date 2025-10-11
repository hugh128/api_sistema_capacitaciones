import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoAsociadoDto } from './create-documento-asociado.dto';

export class UpdateDocumentoAsociadoDto extends PartialType(CreateDocumentoAsociadoDto) {}
