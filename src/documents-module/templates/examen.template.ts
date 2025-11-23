import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions, TFontDictionary, Content } from "pdfmake/interfaces";
import * as fs from 'fs';
import { CreateExamDto } from "../dto/crear-examen-pd.dto";
import { PDFDocument } from 'pdf-lib';

const fonts: TFontDictionary = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  },
};

// Crear encabezado
const createHeaderExamen = (currentPage: number, pageCount: number, logo: string, fechaEmision: string): any => {
  return {
    margin: [25, 40, 25, 0],
    table: {
      widths: ['24%', '50%', '26%'],
      body: [
        // --- FILA 1: ENCABEZADO (Logo, Título, Código)
        [
          {
            image: `data:image/png;base64,${logo}`,
            width: 46,
            alignment: 'center',
            margin: [0, 0, 0, 0]
          },
          { text: 'EVALUACIÓN DEL SISTEMA DOCUMENTAL', fontSize: 14, bold: true, alignment: 'center', margin: [4, 8, 4, 0] },
          {
            table: {
              widths: ['100%'],
              body: [
                [{ text: 'Código:', fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] }],
                [{ text: 'DG-REG-006', fontSize: 11, bold: true, alignment: 'center', margin: [0, -4, 0, 0] }],
                [{ text: `Página ${currentPage} de ${pageCount}`, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] }]
              ]
            },
            layout: {
              hLineWidth: (i: number) => (i === 2 ? 0.5 : 0),
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
          { text: 'Versión: 003', fontSize: 11, alignment: 'center', margin: [2, 5, 2, 0] },
          { text: `Fecha de emisión: ${fechaEmision}`, fontSize: 11, alignment: 'center', margin: [2, 5, 2, 0] },
          { text: 'Fecha de próxima revisión:\nMAYO/2029', fontSize: 11, alignment: 'center', margin: [2, 0, 2, 0] }
        ]
      ]
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => 'black',
      vLineColor: () => 'black'
    },
  };
}

// Crear pie de página
const createFooterExamen = (currentPage: number, pageCount: number): any => {
  return {
    columns: [
      {
        text: 'Doc. Asociado: DG-PEO-005',
        fontSize: 10,
        italics: true,
        alignment: 'left',
        margin: [25, 3, 0, 0]
      },
      {
        text: `Página ${currentPage} de ${pageCount}`,
        fontSize: 10,
        alignment: 'right',
        margin: [0, 3, 25, 0]
      }
    ]
  };
}

function buildDynamicExamContent(series): Content[] {
  const content: Content[] = [];

  let questionCounter = 1;

  series.forEach((ser) => {

    content.push({
      text: [
        { text: `${ser.title}: `, bold: true, fontSize: 12 },
        { text: ser.instructions ?? "", fontSize: 11 }
      ],
      margin: [0, 15, 0, 0]
    });

    ser.questions.forEach((q) => {
      content.push({
        text: `${questionCounter}. ${q.question}`,
        fontSize: 11,
        margin: [0, 10, 0, 5]
      });

      if (q.type === "OPEN") {
        const numLines = q.lines ?? 3;

        for (let i = 0; i < numLines; i++) {
          content.push({
            canvas: [
              { type: "line", x1: 10, y1: 0, x2: 535, y2: 0, lineWidth: 0.5 }
            ],
            margin: [0, 10, 0, 8]
          });
        }

      } else if (q.type === "ESSAY") {
        const numLines = q.lines ?? 10;

        for (let i = 0; i < numLines; i++) {
          content.push({
            canvas: [
              { type: "line", x1: 10, y1: 0, x2: 535, y2: 0, lineWidth: 0.5 }
            ],
            margin: [0, 10, 0, 8]
          });
        }

      } else if (q.type === "MULTIPLE_CHOICE") {
        const optionsTable: Content = {
          table: {
            widths: ["5%", "95%"],
            body: q.options.map((opt) => [
              `${opt.label})`,
              opt.text
            ])
          },
          layout: "noBorders",
          fontSize: 11,
          margin: [10, 2, 0, 5] as [number, number, number, number]
        };

        content.push(optionsTable);
      }

      questionCounter++;
    });
  });

  return content;
}

// Función para crear el contenido de un examen individual
function buildSingleExamContent(data: CreateExamDto, fechaEmisionCorta: string): Content[] {
  return [
    // Tabla de información de capacitación
    {
      table: {
        widths: ['74%', '26%',],
        body: [
          [
            {
              text: [
                { text: `Nombre de la capacitación: `, fontSize: 11, bold: true },
                { text: data.trainingName || '', fontSize: 11 }
              ],
              margin: [0, 2, 0, 2]
            },

            {
              table: {
                widths: ['50%', '50%',],
                body: [
                    [
                      { text: 'Interna', fontSize: 11, alignment: 'right', },
                      { text: data.internal, fontSize: 11 }
                    ],
                    [
                      { text: 'Externa', fontSize: 11, alignment: 'right', },
                      { text: data.external, fontSize: 11 }
                    ],
                ],
              },
              layout: {
                hLineWidth: function(i) {
                  if (i === 1) { return 0.5; }
                  return 0;
                },
                vLineWidth: function(i) {
                  if (i === 1) { return 0.5; }
                  return 0;
                },
                hLineColor: function() { return 'black'; },
                vLineColor: function() { return 'black'; }
              },
              margin: [-4, 0, -4, -2],
            }
          ],

          [
            { text: [
              { text: `Código del documento: `, fontSize: 11, bold: true },
              { text: data.documentCode || "Sin codigo", fontSize: 11 },
            ], margin: [0, 2, 0, 2] },
            { 
              text: 'Fecha:',
              fontSize: 11, 
              margin: [0, 2, 0, 0],
              border: [true, true, true, false]
            },
          ],
          
          [
            { text: [
              { text: `Nombre del colaborador: `, fontSize: 11, bold: true },
              { text: data.collaboratorName, fontSize: 11 },
            ], margin: [0, 2, 0, 2] },
            { 
              text: fechaEmisionCorta,
              alignment: 'center',
              fontSize: 11, 
              margin: [0, 0, 0, 2],
              border: [true, false, true, true]
            }, 
          ],

          [
            { text: 'Firma del colaborador:', fontSize: 11, bold: true, margin: [0, 2, 0, 2] },
            { 
              text: 'Calificación:', 
              fontSize: 11, 
              margin: [0, 2, 0, 2],
              rowSpan: 2,
            },
          ],

          [
            { text: [
              { text: `Departamento / Área: `, fontSize: 11, bold: true },
              { text: data.department, fontSize: 11 },
            ], margin: [0, 2, 0, 2] },
            { text: '', fontSize: 11, margin: [0, 0, 0, 0] },
          ],
        ]
      },
      layout: {
        hLineWidth: function() { return 0.5; },
        vLineWidth: function() { return 0.5; },
        hLineColor: function() { return 'black'; },
        vLineColor: function() { return 'black'; }
      },
      margin: [0, 0, 0, 0]
    },

    // Instrucciones
    {
      table: {
        widths: ['100%'],
        body: [
          [
            {
              text: [
                {
                    text: 'Nota: ', bold: true
                },
                {
                    text: `Utilize lapicero de color azul, la evaluación se aprueba con una nota mayor o igual al ${data.passingScore}%.`
                },
              ],
              fontSize: 11,
              margin: [0, 0, 0, 0]
            }
          ],
          [
            {
              text: [
                {
                    text: 'Instrucciones: ', bold: true
                },
                {
                    text: '(Brindar instrucciones para cada serie e indicar el punteo de cada pregunta).'
                },
              ],
              fontSize: 12,
              margin: [0, 5, 0, 0]
            }
          ],
        ]
      },
      layout: 'noBorders',
      margin: [0, 5, 0, 0],
    },

    // ============= CONTENIDO DEL EXAMEN =============
    {
        stack: [
          ...buildDynamicExamContent(data.series)
        ],
        margin: [10, 0, 10, 0]
    },
  ];
}

// Generar un solo examen
export const crearExamenPdf = async (data: CreateExamDto): Promise<Buffer> => {
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

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [25, 140, 25, 45],
    
    header: (currentPage, pageCount) => {
      return createHeaderExamen(currentPage, pageCount, logo, fechaEmision);
    },
    
    footer: (currentPage, pageCount) => {
      return createFooterExamen(currentPage, pageCount);
    },
    
    content: buildSingleExamContent(data, fechaEmisionCorta)
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
};

export const crearExamenesCombinados = async (examenes: CreateExamDto[]): Promise<Buffer> => {
  const pdfBuffers: Buffer[] = [];
  
  for (let i = 0; i < examenes.length; i++) {
    const buffer = await crearExamenPdf(examenes[i]);
    pdfBuffers.push(buffer);
  }
  
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < pdfBuffers.length; i++) {
    const pdfDoc = await PDFDocument.load(pdfBuffers[i]);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  
  const mergedPdfBytes = await mergedPdf.save();

  return Buffer.from(mergedPdfBytes);
};
