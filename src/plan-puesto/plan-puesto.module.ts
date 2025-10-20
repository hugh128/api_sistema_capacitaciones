import { Module } from '@nestjs/common';
import { PlanPuestoService } from './plan-puesto.service';
import { PlanPuestoController } from './plan-puesto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanPuesto } from './entities/plan-puesto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanPuesto])],
  controllers: [PlanPuestoController],
  providers: [PlanPuestoService],
})
export class PlanPuestoModule {}
