import { PartialType } from '@nestjs/mapped-types';
import { CreateRolPermisoDto } from './create-rol-permiso.dto';

export class UpdateRolPermisoDto extends PartialType(CreateRolPermisoDto) {}
