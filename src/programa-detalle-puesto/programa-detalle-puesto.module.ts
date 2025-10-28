import { Module } from '@nestjs/common';
import { ProgramaDetallePuestoService } from './programa-detalle-puesto.service';
import { ProgramaDetallePuestoController } from './programa-detalle-puesto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramaDetallePuesto } from './entities/programa-detalle-puesto.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramaDetallePuesto])],
  controllers: [ProgramaDetallePuestoController],
  providers: [ProgramaDetallePuestoService, DatabaseErrorService],
})
export class ProgramaDetallePuestoModule {}
