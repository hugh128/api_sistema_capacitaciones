import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaPermisoDto } from './create-categoria-permiso.dto';

export class UpdateCategoriaPermisoDto extends PartialType(CreateCategoriaPermisoDto) {}
