// src/pdf/pdf-module.controller.ts
import { Controller, Get, Param, Res, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { PdfService } from './pdf-module.service';
import type { Response } from 'express';
import { FormatoAsistenciaFrontendDto } from './dto/formato-asistencia.dto';

@Controller('pdf-module')
export class PdfController {
  constructor(private readonly pdfService: PdfService)
  
  {}

  @Get('induccion/:idDocumento')
  async generarInduccion(@Param('idDocumento') idDocumento: number, @Res() res: Response) {
    const file = await this.pdfService.generarInduccionDocumental(idDocumento);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="induccion_${idDocumento}.pdf"`,
    });
    file.getStream().pipe(res);
  }

  @Post('asistencia')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async generarAsistencia(@Body() datos: FormatoAsistenciaFrontendDto, @Res() res: Response) {
    const file = await this.pdfService.generarListadoAsistencia(datos);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="lista_de_asistencia.pdf"',
    });
    file.getStream().pipe(res);
  }
}

