import { Module } from '@nestjs/common';
import { DocumentoAsociadoService } from './documento-asociado.service';
import { DocumentoAsociadoController } from './documento-asociado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoAsociado } from './entities/documento-asociado.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentoAsociado])],
  controllers: [DocumentoAsociadoController],
  providers: [DocumentoAsociadoService, DatabaseErrorService],
})
export class DocumentoAsociadoModule {}
