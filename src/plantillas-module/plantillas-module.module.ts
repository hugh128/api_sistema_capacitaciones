import { Module } from '@nestjs/common';
import { PlantillasModuleService } from './plantillas-module.service';
import { PlantillasModuleController } from './plantillas-module.controller';
import { StorageModule } from 'src/storage/storage.module';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantillasModule } from './entities/plantillas-module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlantillasModule]), StorageModule],
  controllers: [PlantillasModuleController],
  providers: [PlantillasModuleService, DatabaseErrorService],
})
export class PlantillasModuleModule {}
