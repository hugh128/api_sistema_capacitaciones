import { Body, Controller, Post, Res } from '@nestjs/common';
import { DocumentsModuleService } from './documents-module.service';
import { CrearAsistenciaPdfDto } from './dto/crear-asistencia-pdf.dto';
import type { Response } from 'express';

@Controller('documents-module')
export class DocumentsModuleController {
  constructor(private readonly documentsModuleService: DocumentsModuleService) {}

  @Post('asistencia')
  async generatePdf(@Body() data: CrearAsistenciaPdfDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.documentsModuleService.generatePdf(data);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=capacitacion.pdf',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ msg: 'Error al generar el PDF', error: error });
    }
  }

}
