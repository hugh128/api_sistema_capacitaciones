import { Module } from '@nestjs/common';
import { ProgramaCapacitacionService } from './programa-capacitacion.service';
import { ProgramaCapacitacionController } from './programa-capacitacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramaCapacitacion } from './entities/programa-capacitacion.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramaCapacitacion])],
  controllers: [ProgramaCapacitacionController],
  providers: [ProgramaCapacitacionService, DatabaseErrorService],
})
export class ProgramaCapacitacionModule {}
