import { Injectable } from '@nestjs/common';
import { CrearAsistenciaPdfDto } from './dto/crear-asistencia-pdf.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import PdfPrinter from 'pdfmake';
import * as fs from 'fs';
import { CrearInduccionDocumentalDto } from './dto/crear-induccion-documental.dto';
import { crearInduccionDocumentalPdf } from './templates/induccion-documental.template';

@Injectable()
export class DocumentsModuleService {

  private fonts = {
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


  // Función auxiliar para crear checkbox marcado
  private createCheckedBox() {
    return {
      canvas: [
        {
          type: 'rect',
          x: 3,
          y: 0,
          w: 14,
          h: 14,
          lineWidth: 1,
          lineColor: 'black'
        },
        {
          type: 'line',
          x1: 6,
          y1: 2,
          x2: 14,
          y2: 12,
          lineWidth: 2,
          lineColor: 'black'
        },
        {
          type: 'line',
          x1: 14,
          y1: 2,
          x2: 6,
          y2: 12,
          lineWidth: 2,
          lineColor: 'black'
        },
      ],
      margin: [30, 0, 0, 0]
    };
  }

  // Función auxiliar para crear checkbox vacío
  private createUncheckedBox() {
    return {
      canvas: [
        {
          type: 'rect',
          x: 3,
          y: 0,
          w: 14,
          h: 14,
          lineWidth: 1,
          lineColor: 'black'
        }
      ],
      margin: [30, 0, 0, 0]
    };
  }

  // Crear encabezado (se repetirá en cada página)
  private createHeader(currentPage: number, pageCount: number, logo: string, fechaEmision: string): any {
    return {
      margin: [25, 45, 25, 0],
      table: {
        widths: ['22%', '48%', '30%'],
        body: [
          // --- FILA 1: ENCABEZADO (Logo, Título, Código)
          [
            {
              image: `data:image/png;base64,${logo}`,
              width: 46,
              alignment: 'center',
              margin: [0, 0, 0, 0]
            },
            { text: 'CAPACITACION DE PERSONAL', fontSize: 14, bold: true, alignment: 'center', margin: [0, 15, 0, 0] },
            {
              table: {
                widths: ['*'],
                body: [
                  [{ text: 'Código:', fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] }],
                  [{ text: 'RRHH-REG-001', fontSize: 11, bold: true, alignment: 'center', margin: [0, -4, 0, 0] }],
                  [{ text: `Página ${currentPage} de ${pageCount}`, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] }]
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
            { text: 'Versión: 004', fontSize: 11, alignment: 'center', margin: [2, 5, 2, 0] },
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
      }
    };
  }

  // Crear pie de página
  private createFooter(currentPage: number, pageCount: number): any {
    return {
      columns: [
        {
          text: 'Doc. Asociado: RRHH-PEO-008',
          fontSize: 10,
          italics: true,
          alignment: 'left',
          margin: [25, 3, 0, 40]
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          fontSize: 10,
          alignment: 'right',
          margin: [0, 3, 25, 40]
        }
      ]
    };
  }

  // Generar filas de tipo de capacitación
  private buildTrainingTypeRows(data: CrearAsistenciaPdfDto): any[] {
    const rows: any[] = [];

    // Checkbox Sistema documental
    rows.push([
      data.sistemaDocumental ? this.createCheckedBox() : this.createUncheckedBox(),
      { colSpan: 3, text: 'Sistema documental', fontSize: 11, margin: [-100, 0, 0, 0] },
      {},
      {}
    ]);

    // Mostrar detalles solo si Sistema documental está marcado
    if (data.sistemaDocumental) {
      rows.push([
        { text: 'Código del documento:', fontSize: 11, margin: [10, 0, 0, 0] },
        { text: data.codigoDocumento || '', fontSize: 11, decoration: 'underline', margin: [-27, 0, 0, 0] },
        { text: 'Versión:', fontSize: 11, margin: [0, 0, 0, 0] },
        { text: data.version || '', fontSize: 11, decoration: 'underline', margin: [-30, 0, 0, 0] }
      ]);

      rows.push([
        {
          colSpan: 4,
          text: `Documentos asociados: ${data.documentosAsociados || ''}`,
          fontSize: 11,
          margin: [10, 0, 0, 0]
        },
        {},
        {},
        {}
      ]);
    }

    // Checkbox TALLER
    rows.push([
      data.taller ? this.createCheckedBox() : this.createUncheckedBox(),
      { colSpan: 3, text: 'TALLER', fontSize: 11, margin: [-100, 0, 0, 0] },
      {},
      {}
    ]);

    // Checkbox CURSO
    rows.push([
      data.curso ? this.createCheckedBox() : this.createUncheckedBox(),
      { colSpan: 3, text: 'CURSO', fontSize: 11, margin: [-100, 0, 0, 0] },
      {},
      {}
    ]);

    // Checkbox OTRO
    rows.push([
      data.otro ? this.createCheckedBox() : this.createUncheckedBox(),
      { colSpan: 3, text: 'OTRO*', fontSize: 11, margin: [-100, 0, 0, 0] },
      {},
      {}
    ]);

    return rows;
  }

  // Generar filas de asistentes
  private buildAttendeeRows(asistentes: CrearAsistenciaPdfDto['asistentes']): any[] {
    return asistentes.map((asistente, index) => [
      { text: (index + 1).toString(), fontSize: 10, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: asistente.nombre, fontSize: 10, margin: [2, 4, 2, 4] },
      { text: '', fontSize: 10, margin: [2, 4, 2, 4] },
      { text: asistente.area, alignment: 'center', fontSize: 10, margin: [2, 4, 2, 4] },
      { text: asistente.nota || '', fontSize: 10, alignment: 'center', margin: [2, 4, 2, 4] }
    ]);
  }

  async generatePdf(data: CrearAsistenciaPdfDto): Promise<Buffer> {
    const logo = fs.readFileSync('src/assets/logo.jpg').toString('base64');

    const printer = new PdfPrinter(this.fonts);

    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const hoy = new Date();
    const fechaEmision = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [25, 130, 25, 60],
      
      header: (currentPage, pageCount) => {
        return this.createHeader(currentPage, pageCount, logo, fechaEmision);
      },
      
      footer: (currentPage, pageCount) => {
        return this.createFooter(currentPage, pageCount);
      },
      
      content: [
        // Tipo capacitación + Origen
        {
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [{ text: 'Tipo de capacitación:', fontSize: 11, margin: [0, 0, 0, 0] }],
                      [{
                        table: {
                          widths: ['40%', '25%', '20%', '15%'],
                          body: this.buildTrainingTypeRows(data)
                        },
                        layout: 'noBorders'
                      }]
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [{ text: 'Origen de la Capacitación:', fontSize: 11, bold: true, margin: [0, 0, 0, 0] }],
                      [{
                        table: {
                          widths: ['50%', '50%'],
                          body: [
                            [
                              {
                                ...(data.interno ? this.createCheckedBox() : this.createUncheckedBox()),
                                alignment: 'center',
                                margin: [0, 0, 0, 0]
                              } as any,
                              { text: 'Interno', fontSize: 11, margin: [-25, 0, 0, 0] }
                            ],
                            [
                              {
                                ...(data.externo ? this.createCheckedBox() : this.createUncheckedBox()),
                                alignment: 'center',
                                margin: [0, 0, 0, 0]
                              } as any,
                              { text: 'Externo', fontSize: 11, margin: [-25, 0, 0, 0] }
                            ]
                          ]
                        },
                        layout: 'noBorders'
                      }],
                      [{ text: 'Grupo Objetivo:', fontSize: 11, bold: true, margin: [0, 0, 0, 0] }],
                      [{ text: data.grupoObjetivo, fontSize: 11, margin: [0, 0, 0, 0] }]
                    ]
                  },
                  layout: {
                    hLineWidth: (i) => (i === 2 ? 0.5 : 0),
                    vLineWidth: () => 0,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black'
                  },
                  margin: [-4, 0, -4, 0]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: (i) => (i === 0 ? 0.5 : 0),
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black'
          },
          margin: [0, 0, 0, 0]
        },

        // Nombre y objetivo de capacitación
        {
          table: {
            widths: ['22%', '78%'],
            body: [
              [
                { text: 'Nombre de la\ncapacitación', fontSize: 11, bold: true, alignment: 'center', margin: [2, 0, 2, 0] },
                { text: data.nombreCapacitacion, fontSize: 11, margin: [2, 0, 2, 0] }
              ],
              [
                { text: 'Objetivo de\ncapacitación', fontSize: 11, bold: true, alignment: 'center', margin: [2, 0, 2, 0] },
                { text: data.objetivoCapacitacion, fontSize: 11, margin: [2, 5, 2, 5] }
              ]
            ]
          },
          layout: {
            hLineWidth: (i, node) => (i === node.table.body.length ? 0 : 0.5),
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black'
          },
          margin: [0, 0, 0, 0]
        },

        // Datos facilitador e instrucciones
        {
          table: {
            widths: ['40%', '18%', '25%', '17%'],
            body: [
              [
                { text: 'Nombre del Facilitador', fontSize: 11, bold: true, alignment: 'center', margin: [2, 5, 2, 5] },
                { text: 'Fecha de\ncapacitación', fontSize: 11, bold: true, alignment: 'center', margin: [2, 0, 2, 0] },
                { text: 'Horario', fontSize: 11, bold: true, alignment: 'center', margin: [2, 5, 2, 5] },
                { text: 'Horas de\ncapacitación', fontSize: 11, bold: true, alignment: 'center', margin: [2, 0, 2, 0] }
              ],
              [
                { text: data.nombreFacilitador, fontSize: 11, margin: [2, 4, 2, 4] },
                { text: data.fechaCapacitacion, alignment: 'center', fontSize: 11, margin: [0, 4, 0, 4] },
                { text: data.horario, alignment: 'center', fontSize: 11, margin: [0, 4, 0, 4] },
                { text: data.horasCapacitacion, alignment: 'center', fontSize: 11, margin: [0, 4, 0, 4] }
              ],
              [
                {
                  colSpan: 4,
                  text: [
                    { text: 'Instrucciones: ', fontSize: 9, bold: true },
                    { text: 'El facilitador deberá documentar la siguiente información concerniente a la capacitación a impartir: Indicar si se trata de un PEO (Procedimiento Específico de Operación), si es un PEO o instructivo, hacer referencia al número de código que le corresponda dentro del sistema documental.\n', fontSize: 9 },
                    { text: 'Especificar el tipo de capacitación (taller o curso): si es un taller, se especificará que el objetivo de la capacitación se alcanza impartiendo dicho taller, por lo que no se requerirá una evaluación teórica de conocimientos, si es un curso, se deberán adjuntar las evidencias de la evaluación realizada a los asistentes, considerándose aprobado el curso si la nota supera los 70 puntos. Si el personal capacitado no cumple con el mínimo de nota, deberá ser nuevamente entrenado en el tema particular por su jefe inmediato.\n', fontSize: 9 },
                    { text: 'OTRO: ', fontSize: 9, bold: true },
                    { text: 'Documentar el tipo de actividad realizada.', fontSize: 9 }
                  ],
                  alignment: 'justify',
                  lineHeight: 1.1,
                  margin: [4, 3, 4, 3]
                },
                {}, {}, {}
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black'
          },
          margin: [0, 0, 0, 5]
        },

        // Título LISTADO DE ASISTENTES
        {
          stack: [
            {
              text: 'LISTADO DE ASISTENTES',
              bold: true,
              fontSize: 14,
              alignment: 'center',
              margin: [0, 0, 0, 0]
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 162, y2: 0,
                  lineWidth: 1.5,
                  lineColor: 'black'
                }
              ],
              alignment: 'center',
              margin: [0, 0, 0, 5]
            }
          ],
          margin: [0, 4, 0, 0]
        },

        // Tabla de asistentes
        {
          table: {
            headerRows: 1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            widths: ['8%', '40%', '22%', '20%', '10%'],
            body: [
              [
                { text: 'NO.', fontSize: 11, bold: true, alignment: 'center', margin: [2, 2, 2, 2] },
                { text: 'NOMBRE DEL COLABORADOR', fontSize: 11, bold: true, alignment: 'center', margin: [2, 2, 2, 2] },
                { text: 'FIRMA', fontSize: 11, bold: true, alignment: 'center', margin: [2, 2, 2, 2] },
                { text: 'ÁREA', fontSize: 11, bold: true, alignment: 'center', margin: [2, 2, 2, 2] },
                { text: 'NOTA', fontSize: 11, bold: true, alignment: 'center', margin: [2, 2, 2, 2] }
              ],
              ...this.buildAttendeeRows(data.asistentes)
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black'
          },
          margin: [0, 0, 0, 5],
        },

        // Firma del facilitador
        {
          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 210, y2: 0,
                  lineWidth: 0.5,
                  lineColor: 'black'
                }
              ],
              alignment: 'center',
              margin: [0, 0, 0, 0]
            },
            {
              text: 'FIRMA DEL FACILITADOR',
              fontSize: 12,
              alignment: 'center',
              margin: [0, 0, 0, 0]
            }
          ],
          margin: [280, 40, 0, 10]
        },

        // Observaciones
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { text: 'OBSERVACIONES:', fontSize: 11, bold: true, alignment: 'left', margin: [0, 5, 0, 5] }
              ],
              [
                { text: data.observaciones || '', margin: [10, 10, 10, 10] }
              ]
            ]
          },
          layout: {
            hLineWidth: (i) => (i === 1 ? 0 : 0.5),
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black'
          },
          margin: [0, 0, 0, 5]
        }
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

  async generateInduccionDocumental(data: CrearInduccionDocumentalDto): Promise<Buffer> {
    try {
      const pdfBuffer = await crearInduccionDocumentalPdf(data);
      return pdfBuffer;
    } catch (error) {
      console.error("[SERVICE] Error durante la generación del PDF:", error);
      throw new Error('No se pudo generar el documento PDF.');
    }
  }
}
