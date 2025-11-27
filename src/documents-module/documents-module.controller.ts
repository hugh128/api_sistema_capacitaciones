import { Body, Controller, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { DocumentsModuleService } from './documents-module.service';
import { CrearAsistenciaPdfDto } from './dto/crear-asistencia-pdf.dto';
import type { Response } from 'express';
import { CrearInduccionDocumentalDto } from './dto/crear-induccion-documental.dto';
import { CreateExamDto } from './dto/crear-examen-pd.dto';

@Controller('documents-module')
export class DocumentsModuleController {
  constructor(private readonly documentsModuleService: DocumentsModuleService) {}

  @Post('asistencia')
  async generatePdf(@Body() data: CrearAsistenciaPdfDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.documentsModuleService.generateListadoAsistencia(data);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=listado-asistencia.pdf',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ msg: 'Error al generar el PDF de listado de asistencia', error: error });
    }
  }

  @Post('induccion-documental')
  async generateInduccionDocumental(@Body() data: CrearInduccionDocumentalDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.documentsModuleService.generateInduccionDocumental(data);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=induccion-documental.pdf',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ msg: 'Error al generar el PDF de induccion documental', error: error });
    }
  }

  @Post('examen')
  async generateExamen(@Body() data: CreateExamDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.documentsModuleService.generateExamen(data);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=examen.pdf',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ msg: 'Error al generar el PDF de examen', error: error });
    }
  }

  @Post('examenes-combinados')
  async generateCombinedExams(
    @Body() examenes: CreateExamDto[], 
    @Res() res: Response
  ) {
    try {
      
      const pdfBuffer = await this.documentsModuleService.generateCombinedExams(examenes);

      //const fecha = new Date().toISOString().split('T')[0];
      //const nombreArchivo = `examenes_combinados_${fecha}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=examenes.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
      
    } catch (error) {
      
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          statusCode: error.getStatus(),
          message: error.message,
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el PDF de exámenes combinados',
      });
    }
  }

}
