import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaDetalleDto } from './create-programa-detalle.dto';

export class UpdateProgramaDetalleDto extends PartialType(CreateProgramaDetalleDto) {}
