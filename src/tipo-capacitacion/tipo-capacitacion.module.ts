import { Module } from '@nestjs/common';
import { TipoCapacitacionService } from './tipo-capacitacion.service';
import { TipoCapacitacionController } from './tipo-capacitacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCapacitacion } from './entities/tipo-capacitacion.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';
@Module({
  imports: [TypeOrmModule.forFeature([TipoCapacitacion])],
  controllers: [TipoCapacitacionController],
  providers: [TipoCapacitacionService, DatabaseErrorService],
  exports:[TipoCapacitacionService]
})
export class TipoCapacitacionModule {}
