// src/pdf/templates/induccion-documental.template.ts
import { drawText, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { drawTable } from '../utils/draw-table';
import fs from 'fs';

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
  orientation?: 'portrait' | 'landscape';
};

export async function generarInduccionDocumentalPdf(
  data: InduccionData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = fs.readFileSync('src/assets/logo.jpg');

  // Encabezado pequeño
  const header = ['', data.titulo, `Código:\n${data.codigo}`];
  const rowHeader = [
    'Versión: ' + data.version,
    'Fecha de emisión: ' + data.fechaEmision,
    `Fecha de próxima revisión:\n${data.fechaRevision}`,
  ];

  // Cabecera de la tabla principal
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

  // Filas de la tabla principal
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

  // Pesos relativos de las columnas
  const columnWeightsPrincipal = [
    0.03, 0.25, 0.12, 0.08, 0.10, 0.08, 0.1, 0.08, 0.10, 0.12, 0.10, 0.10,
  ];

  // Tamaños estándar A4
  const A4_PORTRAIT: [number, number] = [595, 842];
  const A4_LANDSCAPE: [number, number] = [842, 595];

  // --- 🔹 Orientación seleccionable ---
  const orientation = data.orientation ?? 'landscape'; // por defecto vertical
  const pageSize: [number, number] =
    orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;

  // --- Crear página inicial ---
  let page = pdfDoc.addPage(pageSize);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  const marginX = 30;
  const marginY = 50;
  const startY = pageHeight - 60;

  // --- Datos del colaborador ---
  const infoY = startY - 75;
  const leftX = marginX + 60;
  const rightX = orientation === 'landscape' ? pageWidth - 300 : (2 * pageWidth) / 3;

  page.drawText(`Departamento: ${data.departamento}`, {
    x: leftX,
    y: infoY,
    size: 10,
    font,
  });
  page.drawText(`Cargo: ${data.cargo}`, {
    x: leftX,
    y: infoY - 15,
    size: 10,
    font,
  });
  page.drawText(`Jefe inmediato: ${data.jefeInmediato}`, {
    x: leftX,
    y: infoY - 30,
    size: 10,
    font,
  });
  page.drawText(`Fecha: ${data.fecha}`, {
    x: rightX,
    y: infoY,
    size: 10,
    font,
  });
  page.drawText(`Colaborador: ${data.colaborador}`, {
    x: rightX,
    y: infoY - 15,
    size: 10,
    font,
  });

  // --- Tabla de encabezado pequeño (logo + info) ---
  {
    const result = await drawTable({
      pdfDoc,
      page,
      headers: header,
      rows: [rowHeader],
      font,
      fontSize: 8,
      headerFontSize: 15,
      marginX,
      marginY,
      align: ['center', 'center', 'center'],
      columnWeights: [0.2, 0.6, 0.2],
      images: [[logoBytes, null, null]],
      headerFontSizes: [8, 14, 8],
      headerColors: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
      headerTextColors: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      onCreateNewPage: () => pdfDoc.addPage(pageSize),
    });
  }

  // --- Tabla principal ---
  let currentPage = page;
  let currentStartY = pageHeight - (orientation === 'landscape' ? 180 : 220);

  const result = await drawTable({
    pdfDoc,
    page: currentPage,
    headers,
    rows:[],
    font,
    fontSize: 8,
    headerFontSize: 9,
    headerFontWeights: ['bold'],
    marginX,
    marginY,
    startY: currentStartY,
    align: headers.map(() => 'center') as ('left' | 'center' | 'right')[],
    columnWeights: columnWeightsPrincipal,
    columnFontSizes: headers.map(() => 8),
    cellFontSizes: rows.map(() => headers.map(() => 8)),
    headerColors: headers.map(() => [0.06, 0.31, 0.55] as [number, number, number]),
    headerTextColors: headers.map(() => [1, 1, 1]) as ([number, number, number])[],
    onCreateNewPage: () => pdfDoc.addPage(pageSize),
  });
    currentPage = result.lastPage;
  currentStartY = result.endY;

// ===for(dep of Departamentos)
for (let i=0; i < 10; i++) {
  // --- Tabla tipo “Documento n” (encabezado de bloque) ---
  const result2 = await drawTable({
    pdfDoc,
    page: currentPage,
    headers: [`DEPARTAMENTO ${i + 1}`],
    rows: [],
    font,
    fontSize: 8,
    headerFontSize: 9,
    headerFontWeights: ['bold'],
    marginX,
    marginY,
    startY: currentStartY,
    align: ['center'],
    columnWeights: [1],
    columnHeights: [15], // altura del header de bloque
    rowPadding: 2,
    columnFontSizes: [8],
    cellFontSizes: [[]],
    headerColors: [[1, 1, 1]],
    headerTextColors: [[0, 0, 0]],
    onCreateNewPage: () => pdfDoc.addPage(pageSize),
  });

  currentPage = result2.lastPage;
  currentStartY = result2.endY;

  // --- Tabla con las filas del departamento ---
  const result3 = await drawTable({
    pdfDoc,
    page: currentPage,
    headers: [], // sin headers
    rows, // Aquí se dibujan n filas según el departamento
    font,
    fontSize: 8,
    headerFontSize: 9,
    headerFontWeights: ['bold'],
    marginX,
    marginY,
    startY: currentStartY,
    align: headers.map(() => 'center') as ('left' | 'center' | 'right')[],
    columnWeights: columnWeightsPrincipal,
    columnFontSizes: headers.map(() => 8),
    cellFontSizes: rows.map(() => headers.map(() => 8)),
    headerColors: headers.map(() => [0.06, 0.31, 0.55] as [number, number, number]),
    headerTextColors: headers.map(() => [1, 1, 1]) as ([number, number, number])[],
    rowPadding: 2,
    cellBackgroundColors: [[[1, 1, 1], [1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[1, 1, 1],[0.2,0.7, 0.2]]], // filas alternadas
    // espacio entre filas
    onCreateNewPage: () => pdfDoc.addPage(pageSize),
  });

  currentPage = result3.lastPage;
  currentStartY = result3.endY; // pequeño espacio entre departamentos
}

// === PIE DE PÁGINA (firmas)


const endY = currentStartY;
const footerBoxHeight = 20;
let fy = endY - footerBoxHeight - 10;



  if (fy < 80) {
    // Si el pie no cabe, se crea nueva página
    currentPage = pdfDoc.addPage(pageSize);
    fy = pageHeight - 100;
  }

  currentPage.drawText(`Doc. Asociado:: ${data.codigo}`, {
    x: 30,
    y: currentStartY - 20,
    size: 10,
    font,
  });
 // --- Sección de firmas y campos finales ---
// Ajuste automático según orientación
const fyStart = fy;
const baseYOffsets = [0, -20, -40, -60, -80];
const labels = [
  'Nombre del Jefe Inmediato:',
  'Firma del Jefe Inmediato:',
  'Fecha inicio inducción:',
  'Fecha fin inducción:',
  'Vo.Bo. Recursos Humanos:',
];

// Configuración adaptable según orientación
const config = orientation === 'landscape'
  ? { rightMargin: 820, lineWidth: 160 }  // coordenadas más amplias
  : { rightMargin: 575, lineWidth: 160 }; // portrait más angosto

for (let i = 0; i < labels.length; i++) {
  const label = labels[i];
  const y = fyStart + baseYOffsets[i];

  // Medimos el ancho del texto del label
  const labelWidth = font.widthOfTextAtSize(label, 10);
  // Posición inicial del texto alineado a la derecha
  const labelX = config.rightMargin - config.lineWidth - 10 - labelWidth;
  // Inicio de la línea justo después del texto
  const lineX = config.rightMargin - config.lineWidth;

  // Dibuja el texto alineado
  currentPage.drawText(label, {
    x: labelX,
    y,
    size: 10,
    font,
  });

  // Dibuja la línea
  currentPage.drawText('__________________________', {
    x: lineX,
    y,
    size: 10,
    font,
  });
}

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
