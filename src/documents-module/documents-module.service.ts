import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CrearAsistenciaPdfDto } from './dto/crear-asistencia-pdf.dto';
import { CrearInduccionDocumentalDto } from './dto/crear-induccion-documental.dto';
import { crearInduccionDocumentalPdf } from './templates/induccion-documental.template';
import { CreateExamDto } from './dto/crear-examen-pd.dto';
import { crearExamenesCombinados, crearExamenPdf } from './templates/examen.template';
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

  async generateCombinedExams(examenes: CreateExamDto[]): Promise<Buffer> {
    try {
      if (!examenes || examenes.length === 0) {
        throw new HttpException(
          'Debe proporcionar al menos un examen para generar.',
          HttpStatus.BAD_REQUEST
        );
      }

      examenes.forEach((examen, index) => {
        if (!examen.collaboratorName) {
          throw new HttpException(
            `El examen en la posición ${index + 1} no tiene nombre de colaborador.`,
            HttpStatus.BAD_REQUEST
          );
        }
        if (!examen.series || examen.series.length === 0) {
          throw new HttpException(
            `El examen de ${examen.collaboratorName} no tiene series de preguntas.`,
            HttpStatus.BAD_REQUEST
          );
        }
      });

      const pdfBuffer = await crearExamenesCombinados(examenes);
      
      return pdfBuffer;
    } catch (error) {
      console.error("[SERVICE] Error durante la generación del PDF combinado:", error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'No se pudo generar el PDF de exámenes combinados.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
