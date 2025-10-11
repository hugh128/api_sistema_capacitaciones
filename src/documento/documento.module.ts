import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';
@Module({
  imports: [TypeOrmModule.forFeature([Documento])],
  controllers: [DocumentoController],
  providers: [DocumentoService, DatabaseErrorService],
})
export class DocumentoModule {}
