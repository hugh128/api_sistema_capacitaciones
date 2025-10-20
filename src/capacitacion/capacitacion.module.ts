import { Module } from '@nestjs/common';
import { CapacitacionService } from './capacitacion.service';
import { CapacitacionController } from './capacitacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { Capacitacion } from './entities/capacitacion.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Capacitacion])],
  controllers: [CapacitacionController],
  providers: [CapacitacionService,DatabaseErrorService],
  exports:[CapacitacionService]
})
export class CapacitacionModule {}
