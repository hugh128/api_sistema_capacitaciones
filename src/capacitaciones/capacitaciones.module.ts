import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CapacitacionesController } from './capacitaciones.controller';
import { CapacitacionesService } from './capacitaciones.service';
import { StorageModule } from '../storage/storage.module';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [ConfigModule, StorageModule],
  controllers: [CapacitacionesController],
  providers: [CapacitacionesService, DatabaseErrorService],
  exports: [CapacitacionesService],
})
export class CapacitacionesModule {}
