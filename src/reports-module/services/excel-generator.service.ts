import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { DetalleCapacitacion } from '../interfaces/detalle-capacitacion.interface';
import { CumplimientoColaborador } from '../interfaces/cumplimiento-colaborador.interface';

@Injectable()
export class ExcelGeneratorService {
  /**
   * Genera reporte de detalle de capacitaciones en Excel
   */
  async generarReporteDetalleCapacitaciones(
    datos: DetalleCapacitacion[],
    filtros?: { fechaInicio?: string; fechaFin?: string },
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Detalle de Capacitaciones');

    // Configurar propiedades del documento
    workbook.creator = 'Sistema de Capacitaciones';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Agregar título
    worksheet.mergeCells('A1:V1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DETALLE DE CAPACITACIONES DE COLABORADORES';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Agregar información de filtros si existen
    if (filtros?.fechaInicio || filtros?.fechaFin) {
      worksheet.mergeCells('A2:V2');
      const filterCell = worksheet.getCell('A2');
      const rangoFechas = `Período del ${filtros.fechaInicio || 'Inicio'} al ${filtros.fechaFin || 'Fin'}`;
      filterCell.value = rangoFechas;
      filterCell.font = { size: 11, italic: true };
      filterCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(2).height = 20;
    }

    // Definir encabezados
    const headerRow = worksheet.addRow([
      'No.',
      'Documento',
      'Código',
      'Colaborador',
      'Versión',
      'Fecha Evaluación',
      'Semana',
      'Lectura',
      'Capacitación',
      'Evaluación',
      'Calificación',
      'Firma Facilitador',
      'Firma Colaborador',
      'Estatus',
      'Departamento',
      'Depto',
      'Tipo de documento',
      'Tipo',
      'Departamento Colaborador',
      'Puesto Colaborador',
      'Nombre Plan',
      'Fecha Aplicacion Plan'
    ]);

    headerRow.height = 40;

    const headerRowNumber = headerRow.number;

    const columns = [
      'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V'
    ];
        
    // Estilo de encabezados
    columns.forEach((col) => {
      const cell = worksheet.getCell(`${col}${headerRowNumber}`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF203864' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Agregar datos
    datos.forEach((item) => {
      const row = worksheet.addRow([
        Number(item.NUMERO),
        item.DOCUMENTO,
        item.Codigo,
        item.COLABORADOR,
        item.VersionDoc,
        item.FechaEvaluacion,
        item.Semana,
        item.Lectura,
        item.Capacitacion,
        item.Evaluacion,
        Number(item.Calificacion),
        item.FirmaFacilitador,
        item.FirmaColaborador,
        item.Estatus,
        item.Departamento,
        item.Depto,
        item.TipoDocumento,
        item.Tipo,
        item.DepartamentoColaborador,
        item.PuestoColaborador,
        item.NOMBRE_PLAN,
        this.formatearFecha(item.FECHA_APLICACION_PLAN),
      ]);

      // Aplicar estilo según el estatus
      this.aplicarEstiloEstatus(row, item.Estatus);
    });

    // Ajustar anchos de columnas
    worksheet.columns = [
      { width: 6 },  // No.
      { width: 60 }, // Documento
      { width: 20 }, // Codigo
      { width: 40 }, // Colaborador
      { width: 10 }, // Version
      { width: 20 }, // Fecha Evaluacion
      { width: 15 }, // Semana
      { width: 15 }, // Lectura
      { width: 15 }, // Capacitacion
      { width: 15 }, // Evaluacion
      { width: 15 }, // Calificacion
      { width: 30 }, // Firma Facilitador
      { width: 30 }, // Firma Colaborador
      { width: 15 }, // Estatus
      { width: 25 }, // Departamento
      { width: 15 }, // Depto
      { width: 20 }, // Tipo de documento
      { width: 10 }, // Tipo
      { width: 25 }, // Departamento colaborador
      { width: 25 }, // Puesto colaborador
      { width: 25 }, // Nombre plan
      { width: 20 }, // Fecha Aplicación Plan
    ];

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Genera reporte de cumplimiento de colaboradores en Excel
   */
  async generarReporteCumplimientoColaboradores(
    datos: CumplimientoColaborador[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cumplimiento Colaboradores');

    // Configurar propiedades
    workbook.creator = 'Sistema de Capacitaciones';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Título
    worksheet.mergeCells('A1:P1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DE CUMPLIMIENTO DE COLABORADORES';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Agregar fecha de generación
    worksheet.mergeCells('A2:P2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Fecha de generación: ${new Date().toLocaleDateString('es-GT')}`;
    dateCell.font = { size: 11, italic: true };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    // Encabezados
    const headerRow = worksheet.addRow([
      'ID',
      'Colaborador',
      'Codigo Departamento',
      'Departamento',
      'Puesto',
      'Plan',
      'Total Capacitaciones',
      'Completadas',
      'En Progreso',
      'Pendientes',
      'Reprobadas',
      '% Cumplimiento',
      'Estado Plan',
      'Fecha Inicio Plan',
      'Última Capacitación',
      'Días desde inicio',
    ]);

    headerRow.height = 40;

    const headerRange = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    
    headerRange.forEach((col) => {
      const cell = worksheet.getCell(`${col}3`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF375623' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Agregar datos
    datos.forEach((item) => {
      const row = worksheet.addRow([
        item.ID_COLABORADOR,
        item.COLABORADOR,
        item.CODIGO_DEPARTAMENTO,
        item.DEPARTAMENTO,
        item.PUESTO,
        item.Plan,
        item['Total Capacitaciones'],
        item.Completadas,
        item['En Progreso'],
        item.Pendientes,
        item.Reprobadas,
        item['% Cumplimiento'],
        item['Estado Plan'],
        this.formatearFecha(item['Fecha Inicio Plan']),
        item['Última Capacitación'] ? this.formatearFecha(item['Última Capacitación']) : '',
        item['Días desde inicio'],
      ]);

      // Aplicar formato condicional al porcentaje
      this.aplicarEstiloPorcentaje(row, item['% Cumplimiento']);
    });

    // Ajustar anchos
    worksheet.columns = [
      { width: 5 }, // ID
      { width: 40 }, // Colaborador
      { width: 15 }, // Codigo Departamento
      { width: 20 }, // Departamento
      { width: 25 }, // Puesto
      { width: 30 }, // Plan
      { width: 18 }, // Total Capacitaciones
      { width: 15 }, // Completadas
      { width: 15 }, // En Progreso
      { width: 15 }, // Pendientes
      { width: 15 }, // Reprobadas
      { width: 15 }, // % Cumplimiento
      { width: 15 }, // Estado Plan
      { width: 18 }, // Fecha Inicio
      { width: 18 }, // Última Capacitación
      { width: 18 }, // Días desde inicio
    ];

    // Aplicar bordes
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 2) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Aplica estilo según el estatus de la capacitación
   */
  private aplicarEstiloEstatus(row: ExcelJS.Row, estatus: string) {
    const estatusCell = row.getCell(14); // Columna de estatus
    
    switch (estatus) {
      case 'Completa':
        estatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' },
        };
        estatusCell.font = { color: { argb: 'FF006100' }, bold: true };
        break;
      case 'En Progreso':
        estatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB9C' },
        };
        estatusCell.font = { color: { argb: 'FF9C5700' } };
        break;
      case 'Incompleta':
        estatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' },
        };
        estatusCell.font = { color: { argb: 'FF9C0006' } };
        break;
      case 'En Revisión':
        estatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
        break;
    }
  }

  /**
   * Aplica estilo según el porcentaje de cumplimiento
   */
  private aplicarEstiloPorcentaje(row: ExcelJS.Row, porcentaje: number) {
    const porcentajeCell = row.getCell(12); // Columna de % Cumplimiento
    
    if (porcentaje >= 80) {
      porcentajeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC6EFCE' },
      };
      porcentajeCell.font = { color: { argb: 'FF006100' }, bold: true };
    } else if (porcentaje >= 50) {
      porcentajeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFEB9C' },
      };
      porcentajeCell.font = { color: { argb: 'FF9C5700' } };
    } else {
      porcentajeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC7CE' },
      };
      porcentajeCell.font = { color: { argb: 'FF9C0006' } };
    }

    porcentajeCell.value = porcentaje;
  }

  /**
   * Formatea fecha de ISO a formato legible
   */
  private formatearFecha(fecha: string | null): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return fecha;
    }
  }
}
