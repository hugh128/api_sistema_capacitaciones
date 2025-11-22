import { Injectable } from '@nestjs/common';
import { CrearAsistenciaPdfDto } from './dto/crear-asistencia-pdf.dto';
import { CrearInduccionDocumentalDto } from './dto/crear-induccion-documental.dto';
import { crearInduccionDocumentalPdf } from './templates/induccion-documental.template';
import { CreateExamDto } from './dto/crear-examen-pd.dto';
import { crearExamenPdf } from './templates/examen.template';
import { crearListadoAsistencia } from './templates/listado-asistencia.template';

@Injectable()
export class DocumentsModuleService {

  async generateListadoAsistencia(data: CrearAsistenciaPdfDto): Promise<Buffer> {
    try {
      const pdfBuffer = await crearListadoAsistencia(data);
      return pdfBuffer;
    } catch (error) {
      console.error("[SERVICE] Error durante la generación del listado de asistencia PDF:", error);
      throw new Error('No se pudo generar el documento de listado de asistencia PDF.');
    }
  }

  async generateInduccionDocumental(data: CrearInduccionDocumentalDto): Promise<Buffer> {
    try {
      const pdfBuffer = await crearInduccionDocumentalPdf(data);
      return pdfBuffer;
    } catch (error) {
      console.error("[SERVICE] Error durante la generación del PDF:", error);
      throw new Error('No se pudo generar el documento PDF.');
    }
  }

  async generateExamen(data: CreateExamDto): Promise<Buffer> {
    try {
      const pdfBuffer = await crearExamenPdf(data);
      return pdfBuffer;
    } catch (error) {
      console.error("[SERVICE] Error durante la generación del examen en PDF:", error);
      throw new Error('No se pudo generar el examen PDF.');
    }
  }
}
