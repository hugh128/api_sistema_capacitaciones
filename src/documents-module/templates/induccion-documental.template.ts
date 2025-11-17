import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions, TFontDictionary, TableCell } from 'pdfmake/interfaces';
import * as fs from 'fs';
import { CrearInduccionDocumentalDto } from '../dto/crear-induccion-documental.dto';
import { GrupoCapacitacionDto } from '../dto/grupo-capacitacion.dto';

const fonts: TFontDictionary = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  },

  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
};

// Crear encabezado
const createHeaderInducion = (currentPage: number, pageCount: number, logo: string, fechaEmision: string): any => {
  return {
    margin: [15, 35, 15, 0],
    table: {
      widths: ['27%', '51%', '22%'],
      body: [
        // --- FILA 1: ENCABEZADO (Logo, Título, Código)
        [
          {
            image: `data:image/png;base64,${logo}`,
            width: 46,
            alignment: 'center',
            margin: [0, 0, 0, 0]
          },
          { text: 'INDUCCIÓN DOCUMENTAL AL PUESTO', fontSize: 12, bold: true, alignment: 'center', margin: [0, 15, 0, 0] },
          {
            table: {
              widths: ['*'],
              body: [
                [{ text: 'Código:', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 0] }],
                [{ text: 'DG-REG-018', fontSize: 10, bold: true, alignment: 'center', margin: [0, -4, 0, 0] }],
                [{ text: `Página ${currentPage} de ${pageCount}`, fontSize: 10, alignment: 'center', margin: [0, 0, 0, 0] }]
              ]
            },
            layout: {
              hLineWidth: (i) => (i === 2 ? 0.5 : 0),
              vLineWidth: () => 0,
              hLineColor: () => 'black',
              vLineColor: () => 'black'
            },
            margin: [-4, 0, -4, 0],
            verticalAlignment: 'center'
          },
        ],

        // --- FILA 2: BARRA DE VERSIÓN ---
        [
          { text: 'Versión: 002', fontSize: 11, alignment: 'center', margin: [2, 5, 2, 0] },
          { text: `Fecha de emisión: ${fechaEmision}`, fontSize: 11, alignment: 'center', margin: [2, 5, 2, 0] },
          { text: 'Fecha de próxima revisión:\nJULIO/2029', fontSize: 11, alignment: 'center', margin: [2, 0, 2, 0] }
        ]
      ]
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => 'black',
      vLineColor: () => 'black'
    }
  };
}

// Crear pie de página
const createFooter = (currentPage: number, pageCount: number): any => {
  return {
    columns: [
      {
        text: 'Doc. Asociado: RRHH-PEO-002',
        fontSize: 9,
        italics: true,
        alignment: 'left',
        margin: [25, 3, 0, 0]
      },
      {
        text: `Página ${currentPage} de ${pageCount}`,
        fontSize: 9,
        alignment: 'right',
        margin: [0, 3, 25, 0]
      }
    ]
  };
}

function generateCapacitacionesTable(gruposCapacitacion: GrupoCapacitacionDto[]): TableCell[][] {
  const tableBody: TableCell[][] = [];
  let documentCounter = 0;

  // --- 1. Encabezados de Columna Fijos ---
  const headerRow: TableCell[] = [
    { text: 'No.', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Documento', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Código', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Versión', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Fecha de Evaluación', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 0, 0, 0] },
    { text: 'Lectura', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Capacitación', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Evaluación', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Calificación', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
    { text: 'Firma del Facilitador', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 0, 0, 0] },
    { text: 'Firma del Colaborador', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 0, 0, 0] },
    { text: 'Estatus', fontSize: 9, bold: true, alignment: 'center', color: '#fff', fillColor: '#156082', margin: [0, 4, 0, 2] },
  ];
  tableBody.push(headerRow);

  const totalColumns = 12;

  gruposCapacitacion.forEach(grupo => {
    // Fila de Encabezado del Grupo (Departamento)
    const groupHeaderRow: TableCell[] = [
      {
        colSpan: totalColumns,
        text: grupo.departamentoCapacitacion.toUpperCase(),
        fontSize: 9,
        alignment: 'center',
        italics: true,
        margin: [2, 2, 2, 2]
      },
      ...Array(totalColumns - 1).fill({})
    ];
    tableBody.push(groupHeaderRow);

    // Filas de Documentos dentro del Grupo
    grupo.capacitaciones.forEach(doc => {
      documentCounter++;

      const estatusFillColor = doc.estatus === 'Completa' ? '#92D050' : '#FF0000';

      const docRow: TableCell[] = [
        { text: documentCounter.toString(), fontSize: 8, bold: true, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: doc.documento, fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.codigo, alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.version.toString(), alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.fechaEvaluacion || '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.lectura || '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.capacitacion || '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.evaluacion || '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.calificacion || '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.nombreCapacitador || '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: '', alignment: 'center', fontSize: 8, margin: [0, 0, 0, 0] },
        { text: doc.estatus, alignment: 'center', fontSize: 8, fillColor: estatusFillColor, margin: [0, 0, 0, 0] },
      ];
      tableBody.push(docRow);
    });
  });

  return tableBody;
}

export const crearInduccionDocumentalPdf = async (data: CrearInduccionDocumentalDto): Promise<Buffer> => {
  const logo = fs.readFileSync('src/assets/logo.jpg').toString('base64');

  const printer = new PdfPrinter(fonts);

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const pad = (num: number) => num.toString().padStart(2, '0');

  const hoy = new Date();
  const fechaEmision = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;

  const fechaEmisionCorta = `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;

  const capacitacionesTable = generateCapacitacionesTable(data.gruposCapacitacion);

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageOrientation: 'landscape',
    pageMargins: [15, 120, 15, 40],
    
    header: (currentPage, pageCount) => {
      return createHeaderInducion(currentPage, pageCount, logo, fechaEmision);
    },
    
    footer: (currentPage, pageCount) => {
      return createFooter(currentPage, pageCount);
    },
    
    content: [
      // Información del colaborador
      {
        table: {
          widths: ['50%', '50%'], 
          body: [
            [
              // --- CELDA 1 (Columna Izquierda: Departamento, Cargo, Jefe) ---
              {
                table: {
                  widths: ['55%', '45%'], 
                  body: [
                    [
                      { text: 'Departamento:', fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.departamentoColaborador, fontSize: 10, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: 'Cargo:', fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.cargo, fontSize: 10, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: 'Jefe Inmediato:', fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.jefeInmediatoNombre, fontSize: 10, margin: [0, 0, 0, 0] }
                    ]
                  ]
                },
                layout: 'noBorders'
              },

              // --- CELDA 2 (Columna Derecha: Fecha, Colaborador) ---
              {
                table: {
                  widths: ['40%', '60%'], 
                  body: [
                    [
                      { text: 'Fecha:', fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: fechaEmisionCorta, fontSize: 10, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: 'Colaborador(a):', fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.nombreColaborador, fontSize: 10, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: '', fontSize: 10, margin: [0, 0, 0, 0] },
                      { text: '', fontSize: 10, margin: [0, 0, 0, 0] }
                    ]
                  ]
                },
                layout: 'noBorders'
              }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 10, 0, 10]
      },

      // Tabla de capacitaciones
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          keepWithHeaderRows: 1,
          widths: ['3%', '24%', '9%', '6%', '7%', '6%', '8.5%', '7%', '7.5%', '7%', '8%', '7%'],
          body: capacitacionesTable,
        },
        layout: {
          hLineWidth: function () { return 0.5; },
          vLineWidth: function () { return 0.5; },
          hLineColor: function () { return 'black'; },
          vLineColor: function () { return 'black'; }
        },
        margin: [0, 0, 0, 5]
      },

      // Informacion complementaria
      {
        table: {
          widths: ['100%'], 
          body: [
            [
              {
                table: {
                  widths: ['70.5%', '29.5%'], 
                  body: [
                    [
                      { text: 'Nombre del Jefe Inmediato:', fontSize: 9, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.jefeInmediatoNombre, fontSize: 9, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: 'Firma del Jefe Inmediato:', fontSize: 9, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      {
                        canvas: [
                          {
                            type: 'line',
                            x1: 0, y1: 10, 
                            x2: 220, y2: 10,
                            lineWidth: 0.5,
                            lineColor: 'black'
                          }
                        ],
                        margin: [0, 0, 0, 0] 
                      },
                    ],
                    [
                      { text: 'Fecha de inicio de inducción:', fontSize: 9, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.fechaInicioInduccion, fontSize: 9, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: 'Fecha de finalización de inducción:', fontSize: 9, bold: true, alignment: 'right', margin: [0, 0, 0, 0] },
                      { text: data.fechaFinInduccion, fontSize: 9, margin: [0, 0, 0, 0] }
                    ],
                    [
                      { text: 'Vo.Bo. Recursos Humanos', fontSize: 9, bold: true, alignment: 'right', margin: [0, 20, 0, 0] },
                      {
                        canvas: [
                          {
                            type: 'line',
                            x1: 0, y1: 10, 
                            x2: 220, y2: 10,
                            lineWidth: 0.5,
                            lineColor: 'black'
                          }
                        ],
                        margin: [0, 20, 0, 0]
                      },
                    ],
                  ]
                },
                layout: 'noBorders'
              }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 10, 0, 0]
      },
    ]
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}
