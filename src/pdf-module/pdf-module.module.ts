import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfService } from './pdf-module.service';
import { PdfController } from './pdf-module.controller';
import { Documento } from '../documento/entities/documento.entity';
import { DocumentoAsociado } from '../documento-asociado/entities/documento-asociado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, DocumentoAsociado]),
  ],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}