import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantillasModuleDto } from './create-plantillas-module.dto';

export class UpdatePlantillasModuleDto extends PartialType(CreatePlantillasModuleDto) {}
