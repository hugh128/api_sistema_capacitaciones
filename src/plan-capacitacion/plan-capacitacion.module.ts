import { Module } from '@nestjs/common';
import { PlanCapacitacionService } from './plan-capacitacion.service';
import { PlanCapacitacionController } from './plan-capacitacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanCapacitacion } from './entities/plan-capacitacion.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanCapacitacion])],
  controllers: [PlanCapacitacionController],
  providers: [PlanCapacitacionService, DatabaseErrorService],
})
export class PlanCapacitacionModule {}
