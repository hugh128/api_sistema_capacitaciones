// src/pdf/templates/induccion-documental.template.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { drawTable } from '../utils/draw-table';
import fs from 'fs';
import { info } from 'console';
export type DocumentoRow = {
  no: number;
  nombre: string;
  codigo: string;
  version: string;
  fecha: string;
  lectura: string;
  capacitacion: string;
  evaluacion: string;
  calificacion: string;
  facilitador: string;
  firmaColaborador: string;
  estatus: string;
};

export type InduccionData = {
  titulo: string;
  codigo: string;
  version: string;
  fechaEmision: string;
  fechaRevision: string;
  departamento: string;
  fecha: string;
  cargo: string;
  colaborador: string;
  jefeInmediato: string;
  documentos: DocumentoRow[];
};
/**
 * Genera el PDF de inducción documental usando pdf-lib.
 * Detecta automáticamente si debe usar orientación portrait o landscape.
 */

export async function generarInduccionDocumentalPdf(
  data: InduccionData): Promise<Uint8Array> {

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- Configuración base de tabla ---
  const logoBytes = fs.readFileSync('src/assets/logo.jpg');
  const header = [
    'Logo',
    data.titulo,
    `Código:\n${data.codigo}`,
  ];

  const rowHeader = [
    'Versión: ' + data.version,
    'Fecha de emisión: ' + data.fechaEmision,
    `Fecha de próxima revisión:\n${data.fechaRevision}`,
  ];
  const headers = [
    'No.',
    'Documento',
    'Código',
    'Versión',
    'Fecha de Evaluación',
    'Lectura',
    'Capacitación',
    'Evaluación',
    'Calificación',
    'Firma del Facilitador',
    'Firma del Colaborador',
    'Estatus',
  ];

  const columnWidths = [20, 130, 65, 45, 60, 45, 45, 45, 60, 70, 60, 60];

  const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0) + 60; // margen lateral aproximado

  const A4_PORTRAIT: [number, number] = [595, 842];
  const A4_LANDSCAPE: [number, number] = [842, 595];

  const pageSize = totalTableWidth > A4_PORTRAIT[0] ? A4_LANDSCAPE : A4_PORTRAIT;
  const orientation = totalTableWidth > A4_PORTRAIT[0] ? 'landscape' : 'portrait';

  let page = pdfDoc.addPage(pageSize);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  // --- Márgenes y posiciones según orientación ---
  const marginX = 30;
  const startY = orientation === 'landscape' ? pageHeight - 40 : pageHeight - 60;

  const infoY = startY - 75;


  page.drawText(`Departamento: ${data.departamento}`, { x: marginX+60, y: infoY, size: 10, font });
  /*
  page.drawLine({
    start: { x: marginX + 60 + 100, y: infoY-1},
    end: { x: marginX + 60 + 100 , y: infoY-1 },
    thickness: 0.5, // grosor de la línea
    color: rgb(0, 0, 0),
  });
*/
  page.drawText(`Cargo: ${data.cargo}`, { x: marginX+60, y:infoY-15, size: 10, font });
  page.drawText(`Jefe inmediato: ${data.jefeInmediato}`, { x: marginX+60, y: infoY - 30, size: 10, font });

  page.drawText(`Fecha: ${data.fecha}`, { x: 2*pageWidth / 3, y:infoY,size: 10, font });
  page.drawText(`Colaborador: ${data.colaborador}`, { x: 2*pageWidth / 3, y: infoY - 15, size: 10, font });
  // --- Espacio para tabla ---
  

  const rows = data.documentos.map((d) => [
    d.no.toString(),
    d.nombre,
    d.codigo,
    d.version,
    d.fecha,
    d.lectura,
    d.capacitacion,
    d.evaluacion,
    d.calificacion,
    d.facilitador,
    d.firmaColaborador,
    d.estatus,
  ]);

    drawTable({
    pdfDoc,
    page,
    headers: header,
    rows: [rowHeader],
    font,
    fontSize: 8,
    headerFontSize: 15,
    marginX: 30,
    marginY: 30,
    align: ['center', 'center', 'center'],
    columnWeights: [0.2, 0.6, 0.2],
    cellFontSizes: rows.map(() => [8, 8, 8],[8, 18, 8]),
    headerFontSizes: [8, 14, 8],
      images: [
    [logoBytes, null, null]],
    headerColors: [[1, 1,1], [1, 1, 1], [1, 1, 1]],

  });
  
  // --- Dibuja tabla de registros ---
  drawTable({
    pdfDoc,
    page,
    headers,
    rows: [],
    font,
    fontSize: 8,
    headerFontSize: 9,
    headerFontWeights: ['bold'],
    marginX: marginX,
    marginY: 155,
    align: ['center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center'],
    columnWeights: [0.03, 0.25, 0.12, 0.08, 0.10, 0.08, 0.1, 0.08, 0.10, 0.12, 0.10, 0.10],
    columnFontSizes: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], //tamaño de fuente por columna
    cellFontSizes: [
    [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  ],
  headerColors: [ 
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
    [0.06,0.31,0.55],
  ],
  headerTextColors: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  });

  drawTable({
    pdfDoc,
    page, 
    headers: ['DEPARTAMENTO 1'],
    rows:[],
    font,
    fontSize: 8,
    headerFontSize: 9,
    marginX: marginX,
    marginY: 181,
    align: ['center'],
    columnWeights: [10],
    columnFontSizes: [10],
    cellFontSizes: rows.map(() => [10]),
    headerColors: [
      [1,1,1]],
    headerTextColors: [
      [0,0,0]],
  });

    // --- Dibuja tabla de registros ---
 await drawTable({
  pdfDoc,
  page,
  headers: [],
  rows: rows,
  font,
  fontSize: 8,
  marginX: marginX,
  columnFontSizes: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], //tamaño de fuente por columna
  startY: page.getHeight() - 207,
  columnWeights: [0.03, 0.25, 0.12, 0.08, 0.10, 0.08, 0.1, 0.08, 0.10, 0.12, 0.10, 0.10],
  hideHeader: true,
  cellBackgroundColors: [
  [[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1], [0, 0.8, 0]], // Fila 0: 3 columnas
  [[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1], [1, 1, 1]], // Fila 1
  [[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1], [1, 1, 1]], // Fila 2
]
});
  const footerBoxHeight = 80;
  const footerBoxY = 100;
  const width = page.getWidth();
    // Textos de firmas
  const fy = footerBoxY + footerBoxHeight - 20;

  page.drawText('Nombre del Jefe Inmediato:', { x: marginX + 400, y: fy, size: 10, font });
  page.drawText('__________________________', { x: marginX + 550, y: fy, size: 10, font });

  page.drawText('Firma del Jefe Inmediato:', { x: marginX + 400, y: fy-20, size: 10, font });
  page.drawText('__________________________', { x: marginX + 550, y: fy-20, size: 10, font });

  page.drawText('Fecha inicio inducción:', { x: marginX + 400, y: fy - 40, size: 10, font });
  page.drawText('__________________________', { x: marginX + 550, y: fy - 40, size: 10, font });

  page.drawText('Fecha fin inducción:', { x: marginX + 400, y: fy - 60, size: 10, font });
  page.drawText('__________________________', { x: marginX + 550, y: fy - 60, size: 10, font });

  const voboText = 'Vo.Bo. Recursos Humanos';
  const voboW = font.widthOfTextAtSize(voboText, 10);
  page.drawText(voboText, { x: marginX + 400, y: fy-80, size: 10, font });
  page.drawText('__________________________', { x: marginX + 550, y: fy - 80, size: 10, font });


  // --- Retorna el PDF final ---
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
