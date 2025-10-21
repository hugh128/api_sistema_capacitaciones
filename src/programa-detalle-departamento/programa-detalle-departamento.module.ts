import { Module } from '@nestjs/common';
import { ProgramaDetalleDepartamentoService } from './programa-detalle-departamento.service';
import { ProgramaDetalleDepartamentoController } from './programa-detalle-departamento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramaDetalleDepartamento } from './entities/programa-detalle-departamento.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramaDetalleDepartamento])],
  controllers: [ProgramaDetalleDepartamentoController],
  providers: [ProgramaDetalleDepartamentoService, DatabaseErrorService],
})
export class ProgramaDetalleDepartamentoModule {}
