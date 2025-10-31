// src/pdf/templates/induccion-documental.template.ts
import { drawText, PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { CellContainer, drawTable } from '../utils/draw-table';
import fs from 'fs';


const instrucciones:string = `El facilitador deberá documentar la siguiente información concerniente a la capacitación a impartir Indicar si \n      
                       se trata de un PEO ( Procedimiento Específico de Operación ),  si es un PEO o instructivo,  hacer referencia al número de \n 
                       código que le corresponda dentro del sistema documental. \n
                Especificar el tipo de capacitación ( taller o curso ):   si es un taller,  se especificará que el objetivo de la capacitación se \n 
                    alcanza impartiendo dicho taller,  por lo que no se requerirá una evaluación teórica de conocimientos;   si es un curso,  se \n 
                    deberán adjuntar las evidencias de la evaluación realizada a los asistentes, considerándose aprobado el curso si la nota \n 
                      supera los 70 puntos. Si el personal capacitado no cumple con el mínimo de nota, deberá ser nuevamente entrenado en el \n 
                    tema particular por su jefe inmediato. \n
                    OTRO: Documentar el tipo de actividad realizada.`;


export type colaboradorCapacitado = {
  nombre: string;
};

export type documentoPadre = {
    codigoDocumento: string;
    versionDocumento: string;
}
export type documentosAsociados={
    codigoDocumento: string;
}

export type formatoAsistencia = {
  titulo: string;
  codigo: string;
  version: string;
  fechaEmision: string;
  fechaProximaRevision: string;
  //Ver si es necesario Tipo de capacitacion (Sistema documental)
  //---
  tipoCapacitacion: string;
  //---
  documentoPadre: documentoPadre;
  documentosAsociados: documentosAsociados[];
  grupoObjetivo:string;
  nombreCapacitacion:string;
  objetivoCapacitacion: string;
  nombreFacilitador: string;
  fechaCapacitacion: string;
  horario: string;
  instruccion: string;
  capacitados: colaboradorCapacitado[];
  orientation?: 'portrait' | 'landscape';
};

export async function generarListadoAsistenciaPdf(data: formatoAsistencia): Promise<Uint8Array> {
  
  let numeroPagina : number = 1;
  let totalPaginas : number = 1;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = fs.readFileSync('src/assets/logo.jpg');
  (pdfDoc as any).boldFont = fontBold;
  // Tamaños estándar A4
  const A4_PORTRAIT: [number, number] = [595, 842];
  const A4_LANDSCAPE: [number, number] = [842, 595];

  // --- Orientación seleccionable ---
  const orientation = data.orientation ?? 'landscape'; // por defecto vertical
  const pageSize: [number, number] =
  orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;

  // --- Crear página inicial ---
  let page = pdfDoc.addPage(pageSize);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const marginX = 30;
  const marginY = 50;
    // Grosor de la línea
  const underlineThickness1 = 1;
  let currentPage = page;
  const pages: PDFPage[] = [currentPage];

  let currentStartY = 0;
  // Metodo que pinta el encabezado general de cada pagina
  await drawHeaderPrincipal(pdfDoc,currentPage,numeroPagina,totalPaginas);

  //--------------------------------
  //--- Tabla TipoDeCapacitacion ---
  //--------------------------------
  const codigosAsociados = data.documentosAsociados.map(d => d.codigoDocumento);
    const segundoEncabezado = [
  [
    {
      type: 'container',
      elements: [
        { type: 'text', value: 'Tipo de capacitación:', fontSize: 11 },
        { type: 'space', width: 30 },
        { type: 'checkbox', label: 'Sistema documental', checked: false, fontSize:10 },
        { type: 'newline' },
        { type: 'space', width: 15 },
        { type: 'text', value: `Código del documento: ${data.documentoPadre.codigoDocumento}`, fontSize: 11 , inline:true},
        { type: 'space', width: 110 },
        { type: 'text', value: `Versión: ${data.documentoPadre.versionDocumento}`, fontSize: 11, inline:true },
        { type: 'newline' },
        { type: 'space', width: 30 },
        { type: 'checkbox', label: 'TALLER', checked: false, fontSize:10},
        { type: 'newline' },
        { type: 'space', width: 30 },
        { type: 'checkbox', label: 'CURSO', checked: false, fontSize:10 },
        { type: 'newline' },
        { type: 'space', width: 30 },
        { type: 'checkbox', label: 'OTRO*', checked: false, fontSize:10 },
        { type: 'newline' },
        { type: 'space', width: 15 },
        { type: 'text', value: 'Documentos asociados: ', fontSize:11, bold:true, inline:true},
        { type: 'space', width: 1 },
        { type: 'text', value: `${codigosAsociados}`, fontSize:10, inline:true},
      ],
      gap: 1,
      backgroundColor: [1, 1, 1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      padding: { top: 2, left: 2, right: 2, bottom: 0 },
      
    } as CellContainer,

    {
      type: 'container',
      elements: [
        { type: 'text', value: 'Origen de la Capacitación:', fontSize: 11 },
        { type: 'space', width: 30 },
        { type: 'checkbox', label: 'Interno', checked: false, fontSize:10 },
        { type: 'newline' },
        { type: 'space', width: 30 },
        { type: 'checkbox', label: 'Externo', checked: false, fontSize:10 },
        { type: 'newline' },
        { type: 'text', value: `Grupo Objetivo:` , fontSize: 11 },
        { type: 'space' },
        { type: 'text', value: ` ${data.grupoObjetivo}` , fontSize: 11 },
      ],
      gap: 3,
      padding: { top: 5, left: 4 },
      backgroundColor: [1,1,1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
  ],
];

  const result1 = await drawTable({
    pdfDoc,
      page: currentPage,
      headers: [],
      rows: segundoEncabezado,
      font,
      fontSize: 8,
      headerFontSize: 15,
      marginX,
      marginY,
      startY: currentStartY - 5,
      columnPadding: 5,
      rowPadding:3,
      columnWeights: [0.7, 0.3],
      onCreateNewPage: () => pdfDoc.addPage(pageSize),
  });



// Dibujar la línea del subrayado
page.drawLine({
  start: { x: 163, y: currentStartY-63 },
  end: { x: 280,  y: currentStartY-63 },
  thickness: underlineThickness1,
  color: rgb(0, 0, 0), // negro
});
page.drawLine({
  start: { x: 347, y: currentStartY-63 },
  end: { x: 400,  y: currentStartY-63 },
  thickness: underlineThickness1,
  color: rgb(0, 0, 0), // negro
});
page.drawLine({
  start: { x: 404, y: currentStartY-70 },
  end: { x: 564,  y: currentStartY-70 },
  thickness: underlineThickness1,
  color: rgb(0, 0, 0), // negro
});

 
const tercerEncabezado = [
  [
    
    {
      type: 'container',
      elements: [
        { type: 'text', value: 'Nombre de la \n capacitación', fontSize: 11, bold:true},
      ],
      gap: 0,
      padding: { top: 2, left: 20 },
      backgroundColor: [1, 1, 1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
    {
      type: 'container',
      elements: [
        { type: 'text', value: `${data.nombreCapacitacion}`, fontSize: 11 },
      ],
      gap: 0,
      padding: { top: 2, left: 20 },
      backgroundColor: [1,1,1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
  ],
  [
    {
      type: 'container',
      elements: [
        { type: 'text', value: 'Objetivo de la \n capacitación', fontSize: 11, bold:true },
      ],
      gap: 0,
      padding: { top: 2, left: 20 },
      backgroundColor: [1, 1, 1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
    } as CellContainer,
    {
      type: 'container',
      elements: [
        { type: 'text', value: `${data.objetivoCapacitacion}`, fontSize: 11 },
      ],
      gap: 0,
      padding: { top: 2, left: 20 },
      backgroundColor: [1,1,1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
  ],
];
  currentPage = result1.lastPage;
  currentStartY = result1.endY;
  
const result2 = await drawTable({
    pdfDoc,
      page: currentPage,
      headers: [],
      rows: tercerEncabezado,
      font,
      fontSize: 8,
      marginX,
      marginY,
      startY: currentStartY,
      columnPadding: 1,
      rowPadding:1,
      columnWeights: [0.2, 0.8],
      onCreateNewPage: () => {
        totalPaginas++; 
        return pdfDoc.addPage(pageSize);
      },
  });

  const cuartoEncabezado=[
    'Nombre del Facilitador',
    'Fecha de capacitación',
    'Horario',
    'Horas de capacitación'
  ]
  const filas = [
  [
    
    {
      type: 'container',
      elements: [
        { type: 'text', value: `${data.nombreFacilitador}`, fontSize: 11 },
      ],
      gap: 0,
      padding: { top: 2, left: 2 },
      backgroundColor: [1, 1, 1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
    {
      type: 'container',
      elements: [
        { type: 'text', value: `${data.fechaCapacitacion}`, fontSize: 11 },
      ],
      gap: 0,
      padding: { top: 2, left: 2 },
      backgroundColor: [1,1,1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
    {
      type: 'container',
      elements: [
        { type: 'text', value: `${data.horario}`, fontSize: 11 },
      ],
      gap: 0,
      padding: { top: 2, left: 2 },
      backgroundColor: [1,1,1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
    {
      type: 'container',
      elements: [
        { type: 'space', width: 30 },
      ],
      gap: 0,
      padding: { top: 2, left: 2 },
      backgroundColor: [1,1,1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
  ],
];
  currentPage = result2.lastPage;
  currentStartY = result2.endY;
  
const result3 = await drawTable({
    pdfDoc,
      page: currentPage,
      headers: cuartoEncabezado,
      rows: filas,
      font,
      fontSize: 80,
      headerFontSize: 9,
      headerFont: fontBold,
      marginX,
      marginY,
      startY: currentStartY,
      columnPadding: 15,
      rowPadding:10,
      columnWeights: [1,1,1,1],
      headerColors: [1,1,1],
      onCreateNewPage: () => {
        totalPaginas++; 
        return pdfDoc.addPage(pageSize);
      },
  });

    const tablaInstruccion = [
  [
    {
      type: 'container',
      elements: [
        { type: 'text', value: "Instrucciones: "+instrucciones, fontSize: 9.8,},
      ],
      gap: 0,
      padding: { top: 4, left: 1 },
      backgroundColor: [1, 1, 1],
      borderColor: [0, 0, 0],
      borderWidth: 1,
      
    } as CellContainer,
  ],
];
  currentPage = result3.lastPage;
  currentStartY = result3.endY;
  
const result4 = await drawTable({
    pdfDoc,
      page: currentPage,
      headers: [],
      rows: tablaInstruccion,
      font,
      fontSize: 80,
      marginX,
      marginY,
      startY: currentStartY,
      columnPadding: 15,
      rowPadding:8,
      columnWeights: [1],
      onCreateNewPage: () => {
        totalPaginas++; 
        return pdfDoc.addPage(pageSize);
      },
  });
  currentStartY = result4.endY;
  //--------------------------
  // --- Tabla asistencias ---
  //--------------------------
 // --- Datos del colaborador ---
  const texto = "LISTADO DE ASISTENTES";
  const textWidth = font.widthOfTextAtSize(texto, 14);
  const x = (pageWidth - textWidth) / 2;
  page.drawText(texto, {
    x,
    y: currentStartY-15,
    size: 14,
    font: fontBold,
  });
  // Distancia del texto a la línea (pequeño margen visual)
const underlineOffset = 2;

// Grosor de la línea
const underlineThickness = 1;

// Dibujar la línea del subrayado
page.drawLine({
  start: { x: x, y: currentStartY - 16 - underlineOffset },
  end: { x: x + textWidth+4, y: currentStartY - 16 - underlineOffset },
  thickness: underlineThickness +1,
  color: rgb(0, 0, 0), // negro
});
  //Array de todos las personas capacitadas
 // Asumiendo que rows y columns ya están definidos
const rows = data.capacitados.length;
const columns = 5;

// Creamos un array de CellContainer por fila y columna
const listRowCapacitados: CellContainer[][] = Array.from({ length: rows }, () =>
  Array.from({ length: columns }, () => ({
    type: 'container',
    elements: [{ type: 'text', value: '', fontSize: 10 }],
    gap: 1,
    padding: { top: 2, left: 9 },
    backgroundColor: [1, 1, 1],
    borderColor: [0, 0, 0],
    borderWidth: 1,
  } as CellContainer))
);

// Helper para actualizar texto dentro de un CellContainer
function setCellText(cell: CellContainer, text: string) {
  const el = cell.elements.find(e => e.type === 'text');
  if (el && el.type === 'text') {
    el.value = text;
  }
}

// Llenamos los datos
for (let i = 0; i < rows; i++) {
  if (i < 9){
    setCellText(listRowCapacitados[i][0], "0" + (i + 1)); // Número de fila
  }else setCellText(listRowCapacitados[i][0], "" + (i + 1)); // Número de fila
  setCellText(listRowCapacitados[i][1], data.capacitados[i].nombre); // Nombre
}


 // Definir color RGB a usar
const cellColor: [number, number, number] = [0.949, 0.941, 0.937];

// matriz de colores para cada celda
const cellBackgroundColors = listRowCapacitados.map(row => {
  return row.map((_, colIndex) => {
    if (colIndex === 0) return null; // primera columna sin color
    return cellColor; // columnas 2-5 coloreadas
  });
});

    // Cabecera del listado
  const headerListado = [
    'NO.',
    'NOMBRE DEL COLABORADOR',
    'FIRMA',
    'ÁREA',
    'NOTA',
  ];
    // Filas de la tabla de asistencia
  //Colocar el for
  const rowsListado = data.capacitados.map((d) => [
    d.nombre
  ]);

  // Pesos relativos de las columnas
  const columnWeightsListado = [
    0.05, 0.4, 0.2, 0.2, 0.15,
  ];
      currentPage.drawText(`Doc. Asociado: RRHH-PEO-008`, {
       x: 30,
       y: 20,
       size: 10,
       font,
    });
  currentPage = page;
  //currentStartY = pageHeight - (orientation === 'landscape' ? 180 : 529);
  const result6 = await drawTable({
    pdfDoc,
    page: currentPage,
    headers: headerListado,
    rows:listRowCapacitados,
    font,
    fontSize: 8,
    headerFontSize: 9,
    headerFont: fontBold,
    marginX,
    marginY,
    startY: currentStartY-25,
    columnWeights: columnWeightsListado,
    onCreateNewPage: async () => {
        totalPaginas++; 
        const newPage = pdfDoc.addPage(pageSize);
        const headerResult = await drawHeaderPrincipal(pdfDoc,newPage,numeroPagina,totalPaginas);
        await drawHeaderPrincipal(pdfDoc,currentPage,numeroPagina,totalPaginas);
      currentPage.drawText(`Doc. Asociado: RRHH-PEO-008`, {
       x: 30,
       y: 20,
       size: 10,
       font,
      });
        currentPage.drawLine({
          start: { x: 405, y: 755 },
          end: { x: 565,  y: 755 },
          thickness: underlineThickness1,
          color: rgb(0, 0, 0), // negro
        });
        currentStartY = headerResult-5;
        pages.push(newPage);
        return newPage;
      },
      onCreateNewPageStartY: (page)=> {
        return currentStartY;
      },
  });
  currentPage = result6.lastPage;
  currentStartY = result6.endY;

// === PIE DE PÁGINA (firmas)
const endY = currentStartY;
const footerBoxHeight = 20;
let fy = endY - footerBoxHeight - 10;

  if (fy < 80) {
    // Si el pie no cabe, se crea nueva página
    totalPaginas++; 
    const newPage = pdfDoc.addPage(pageSize);
    pages.push(newPage);
    currentPage = newPage;
    fy = pageHeight - 200;
    currentPage.drawText(`Doc. Asociado: RRHH-PEO-008`, {
       x: 30,
       y: 20,
       size: 10,
       font,
    });
  }


 // --- Sección de firmas y campos finales ---
// Ajuste automático según orientación
const fyStart = fy;

// Configuración adaptable según orientación
const config = orientation === 'landscape'
  ? { rightMargin: 820, lineWidth: 200 }  // coordenadas más amplias
  : { rightMargin: 575, lineWidth: 200 }; // portrait más angosto

  const label = "FIRMA DEL FACILITADOR";
  const y = fyStart-15;

  // Medimos el ancho del texto del label
  const labelWidth = font.widthOfTextAtSize(label, 10);
  // Posición inicial del texto alineado a la derecha
  const labelX = config.rightMargin - config.lineWidth/4 - labelWidth;
  // Inicio de la línea justo después del texto
  const lineX = config.rightMargin - config.lineWidth;

   // Dibuja la línea
  currentPage.drawText('__________________________________', {
    x: lineX,
    y,
    size: 10,
    font,
  });

  // Dibuja el texto alineado
  currentPage.drawText(label, {
    x: labelX,
    y: y-15,
    size: 10,
    font,
  });

  currentStartY = y-20;

  console.log(currentStartY)
  const observaciones = [
    [
      {
        type: 'container',
        elements: [
          { type: 'text', value: `OBSERVACIONES: `, fontSize: 11 },
        ],
        gap: 60,
        padding: { top: 2, left: 10 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,

      } as CellContainer,
    ],
  ];

    const result7 = await drawTable({
    pdfDoc,
    page: currentPage,
    headers: [],
    rows:observaciones,
    font,
    fontSize: 8,
    headerFontSize: 9,
    marginX,
    marginY,
    startY: currentStartY-5,
    columnWeights: [1],

    onCreateNewPage: async () => {
       currentPage.drawText(`Doc. Asociado: RRHH-PEO-008`, {
         x: 30,
         y: 20,
         size: 10,
         font,
       });
       totalPaginas++; 
       const newPage = pdfDoc.addPage(pageSize);
       pages.push(newPage);
       //const headerResult = await drawHeaderPrincipal(pdfDoc,newPage,numeroPagina,pages.length);
       //currentStartY = headerResult-5;
       return newPage;
    },
    onCreateNewPageStartY: (page)=> {
      return currentStartY;
    },
    });

  currentPage = result7.lastPage;
  currentStartY = result7.endY;

  // Dibujar la línea del subrayado
  currentPage.drawLine({
    start: { x: 80, y: currentStartY+45 },
    end: { x: 500,  y: currentStartY+45 },
    thickness: underlineThickness1,
    color: rgb(0, 0, 0), // negro
  });
  currentPage.drawLine({
    start: { x: 80, y: currentStartY+20 },
    end: { x: 500,  y: currentStartY+20 },
    thickness: underlineThickness1,
    color: rgb(0, 0, 0), // negro
  });
  
 let numPaginas = pages.length;
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const numeroPagina = i + 1;
    await drawHeaderPrincipal(pdfDoc, page, numeroPagina,numPaginas);

    pages[i].drawLine({
    start: { x: 405, y: 755 },
    end: { x: 565,  y: 755 },
    thickness: underlineThickness1,
    color: rgb(0, 0, 0),
   });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
  
  // Metodo que pinta el encabezado principal que aparece en cada pagina
  async function drawHeaderPrincipal(pdfDoc:  PDFDocument, page: PDFPage, numeroPagina: number, totalPaginas:number): Promise<number>  {
    
  const encabezadoConImagen = [
    [
      {
        type: 'container',
        elements: [
          {
            type: 'image',
            bytes: logoBytes,
            width: 40, 
            height: 40,
          },
        ],
        gap: 5,
        padding: { top: 6, left: 35 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,
        align: 'center',
      } as CellContainer,
      {
        type: 'container',
        elements: [
          { type: 'text', value: `${data.titulo}`, fontSize: 15, bold:true },
        ],
        gap: 5,
        padding: { top: 20, left: 10 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,
        align: 'center',
      } as CellContainer,
      {
        type: 'container',

        elements: [
          { type: 'text', value: `Código: \n RRHH-REG-001`, fontSize: 12 ,bold:true},
          { type: 'text', value: `Página ${numeroPagina} de ${totalPaginas}`, fontSize: 11 },
        ],
        gap: 1,
        padding: { top: 2, left: 22 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,
        align: 'center',
      } as CellContainer,
    ],
    [
      {
        type: 'container',
        elements: [
          {type: 'text', value: `Versión: ${data.version}`, fontSize:12 },
        ],
        gap: 5,
        padding: { top: 15, left: 4 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,
        align: 'center',
      } as CellContainer,
      {
        type: 'container',
        elements: [
          { type: 'text', value: `Fecha de emisión: ${data.fechaEmision}` , fontSize: 12 },
        ],
        gap: 5,
        padding: { top: 15, left: 10 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,
        align: 'center',
      } as CellContainer,
      {
        type: 'container',
        elements: [
          { type: 'text', value: `Fecha de próxima revisión: \n ${data.fechaProximaRevision}` , fontSize: 12 },
        ],
        gap:5,
        padding: { top: 5, left: 2 },
        backgroundColor: [1, 1, 1],
        borderColor: [0, 0, 0],
        borderWidth: 1,
        align: 'center',
      } as CellContainer,
    ],
  ];
    const result = await drawTable({
      pdfDoc,
      page,
      headers: [],
      rows: encabezadoConImagen,
      font,
      fontSize: 8,
      headerFontSize: 8,
      marginX,
      marginY,
      columnWeights: [0.2, 0.5, 0.3],
    });
    
    currentPage = result.lastPage;
    currentStartY = result.endY;
    return result.endY;
  }
}