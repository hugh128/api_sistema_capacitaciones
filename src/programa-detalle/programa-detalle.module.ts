import { Module } from '@nestjs/common';
import { ProgramaDetalleService } from './programa-detalle.service';
import { ProgramaDetalleController } from './programa-detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramaDetalle } from './entities/programa-detalle.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramaDetalle])],
  controllers: [ProgramaDetalleController],
  providers: [ProgramaDetalleService, DatabaseErrorService],
})
export class ProgramaDetalleModule {}
