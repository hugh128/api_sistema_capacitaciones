import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';

export interface DrawTableOptions {
  pdfDoc: PDFDocument;
  page: PDFPage;
  headers?: string[];
  rows: (string | number | null)[][];
  font: PDFFont;
  fontSize?: number;
  headerFontSize?: number;
  marginX?: number;
  marginY?: number;
  columnWeights?: number[];
  startY?: number;
  rowPadding?: number;
  align?: ('left' | 'center' | 'right') | ('left' | 'center' | 'right')[];
  columnPadding?: number;
  columnFontSizes?: number[];
  cellFontSizes?: number[][];
  headerFontSizes?: number[];
  images?: (Uint8Array | null)[][]; // ← soporta buffers de imágenes
  headerColors?: (string | [number, number, number])[] | [number, number, number];
  columnHeights?: number[];
  headerTextColors?: (string | [number, number, number])[] | [number, number, number];
  rowTextColors?: ((string | [number, number, number])[] | [number, number, number])[];
  headerFontWeights?: ('normal' | 'bold')[];
  rowFontWeights?: (('normal' | 'bold')[] | 'normal' | 'bold')[];
  cellBackgroundColors?: (([number, number, number] | null)[] | [number, number, number] | null)[];
  cellBorderColors?: (([number, number, number] | null)[] | [number, number, number] | null)[];
  cellBorderWidths?: (number[] | number)[];
  hideHeader?: boolean;
  onCreateNewPage?: () => PDFPage;
}

export async function drawTable(options: DrawTableOptions): Promise<{ endY: number; lastPage: PDFPage }> {
  const {
    pdfDoc,
    page,
    headers = [],
    rows,
    font,
    fontSize = 8,
    headerFontSize = 9,
    marginX = 50,
    marginY = 50,
    columnWeights,
    startY,
    rowPadding = 4,
    align = 'center',
    columnPadding = 4,
    images = [],
    headerColors = [0.9, 0.9, 0.9],
    onCreateNewPage,
    columnHeights,
  } = options;

  let currentPage = page;
  const pageWidth = currentPage.getWidth();
  const pageHeight = currentPage.getHeight();
  const usableWidth = pageWidth - marginX * 2;
  const tableWidth = usableWidth;

  const totalWeight =
    columnWeights?.reduce((sum, w) => sum + w, 0) || headers.length || (rows[0]?.length ?? 1);
  const columnWidths =
    columnWeights?.map((w) => (w / totalWeight) * tableWidth) ||
    Array(headers.length || (rows[0]?.length ?? 1)).fill(
      tableWidth / (headers.length || (rows[0]?.length ?? 1))
    );

  let cursorY = startY ?? pageHeight - marginY;

  // === Crea nueva página si se acaba el espacio ===
  async function ensureSpace(height: number) {
    if (cursorY - height < marginY) {
      currentPage = onCreateNewPage ? onCreateNewPage() : pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - marginY;
      if (headers.length > 0 && !options.hideHeader) {
        await drawHeader(currentPage, headers);
      }
    }
  }

  // === HEADER ===
  async function drawHeader(page: PDFPage, headers: string[]) {
    const headerHeight = columnHeights?.[0] ?? 25;
    let cellX = marginX;
    const headerY = cursorY;

    for (let i = 0; i < headers.length; i++) {
      const colWidth = columnWidths[i];
      const sizeHeader = options.headerFontSizes?.[i] ?? headerFontSize;
      const alignType = Array.isArray(align) ? align[i] || 'center' : align || 'center';
      const padding = columnPadding;

      const colorArr = toRGB(
        Array.isArray(headerColors) && typeof headerColors[0] !== 'number'
          ? headerColors[i]
          : headerColors
      ) ?? [0.9, 0.9, 0.9];

      page.drawRectangle({
        x: cellX,
        y: headerY - headerHeight,
        width: colWidth,
        height: headerHeight,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
        color: rgb(...colorArr),
      });

      //IMAGEN EN CELDA DE HEADER 
      const imageBuffer = images?.[0]?.[i];
      if (imageBuffer) {
        try {
          let embeddedImg;
          // Detectar tipo (JPG o PNG)
          if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
            embeddedImg = await pdfDoc.embedPng(imageBuffer);
          } else {
            embeddedImg = await pdfDoc.embedJpg(imageBuffer);
          }

          // Escalado proporcional: nunca se sale del alto ni del ancho
          const maxImgWidth = colWidth - 4; // 2px de margen a cada lado
          const maxImgHeight = headerHeight - 4;

          const aspectRatio = embeddedImg.height / embeddedImg.width;
          let imgWidth = maxImgWidth;
          let imgHeight = imgWidth * aspectRatio;

          // Si se pasa de alto, ajusta de nuevo
          if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight;
            imgWidth = imgHeight / aspectRatio;
          }

          const imgX = cellX + (colWidth - imgWidth) / 2;
          const imgY = headerY - headerHeight + (headerHeight - imgHeight) / 2;


          page.drawImage(embeddedImg, {
            x: imgX,
            y: imgY,
            width: imgWidth,
            height: imgHeight,
          });
        } catch (err) {
          console.warn('Error al dibujar imagen en celda de header:', err);
        }
      }

      // TEXTO DE HEADER
      const text = headers[i]?.toString() ?? '';
      const textColorArr = toRGB(
        Array.isArray(options.headerTextColors) && typeof options.headerTextColors[0] !== 'number'
          ? options.headerTextColors[i]
          : options.headerTextColors
      ) ?? [0, 0, 0];

      const fontWeight = options.headerFontWeights?.[i] === 'bold' ? 'bold' : 'normal';
      const wrappedLines = wrapText(text, colWidth - 2 * padding, font, sizeHeader);
      const totalTextHeight = wrappedLines.length * (sizeHeader + 2);
      const textStartY = headerY - (headerHeight - totalTextHeight) / 2 - sizeHeader;
      let textY = textStartY;

      wrappedLines.forEach((line) => {
        const textX = getAlignedX(line, font, sizeHeader, alignType, cellX, colWidth, padding);
        if (fontWeight === 'bold') {
          page.drawText(line, { x: textX + 0.3, y: textY, size: sizeHeader, font, color: rgb(...textColorArr) });
        }
        page.drawText(line, { x: textX, y: textY, size: sizeHeader, font, color: rgb(...textColorArr) });
        textY -= sizeHeader + 2;
      });

      cellX += colWidth;
    }

    cursorY -= headerHeight;
  }

  // Dibujar header si aplica
  if (headers.length > 0 && !options.hideHeader) {
    await drawHeader(currentPage, headers);
  }

  // Si no hay filas, terminamos
  if (!rows || rows.length === 0) {
    return { endY: cursorY, lastPage: currentPage };
  }

  // === DIBUJAR FILAS ===
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    let maxLines = 1;

    // Calcula altura de la fila
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellText = (row[colIndex] ?? '').toString();
      const sizeCell =
        options.cellFontSizes?.[rowIndex]?.[colIndex] ??
        options.columnFontSizes?.[colIndex] ??
        fontSize;
      const colWidth = columnWidths[colIndex];
      const lines = wrapText(cellText, colWidth - 2 * columnPadding, font, sizeCell);
      maxLines = Math.max(maxLines, lines.length);
    }

    const customHeight = columnHeights?.[rowIndex];
    const rowHeight = customHeight ?? (maxLines * (fontSize + 2) + rowPadding * 2);
    await ensureSpace(rowHeight);

    let cellX = marginX;
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const text = (row[colIndex] ?? '').toString();
      const sizeCell =
        options.cellFontSizes?.[rowIndex]?.[colIndex] ??
        options.columnFontSizes?.[colIndex] ??
        fontSize;
      const alignType = Array.isArray(align) ? align[colIndex] || 'left' : align || 'left';
      const colWidth = columnWidths[colIndex];

      const bgRgb = toRGB(options.cellBackgroundColors?.[rowIndex]?.[colIndex]) ?? null;
      const borderRgb = toRGB(options.cellBorderColors?.[rowIndex]?.[colIndex]) ?? [0, 0, 0];

      currentPage.drawRectangle({
        x: cellX,
        y: cursorY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderWidth: 1,
        borderColor: rgb(...borderRgb),
        color: bgRgb ? rgb(...bgRgb) : undefined,
      });

      const wrappedLines = wrapText(text, colWidth - 2 * columnPadding, font, sizeCell);
      const totalTextHeight = wrappedLines.length * (sizeCell + 2);
      let textY = cursorY - (rowHeight - totalTextHeight) / 2 - sizeCell;

      const textColorArr =
        toRGB(options.rowTextColors?.[rowIndex]?.[colIndex]) ?? [0, 0, 0];

      const rowFontWeight = Array.isArray(options.rowFontWeights)
        ? Array.isArray(options.rowFontWeights[rowIndex])
          ? options.rowFontWeights[rowIndex][colIndex]
          : options.rowFontWeights[rowIndex]
        : 'normal';

      wrappedLines.forEach((line) => {
        const textX = getAlignedX(line, font, sizeCell, alignType, cellX, colWidth, columnPadding);
        if (rowFontWeight === 'bold') {
          currentPage.drawText(line, { x: textX + 0.3, y: textY, size: sizeCell, font, color: rgb(...textColorArr) });
        }
        currentPage.drawText(line, { x: textX, y: textY, size: sizeCell, font, color: rgb(...textColorArr) });
        textY -= sizeCell + 2;
      });

      cellX += colWidth;
    }

    cursorY -= rowHeight;
  }

  return { endY: cursorY, lastPage: currentPage };
}

// === UTILIDADES ===
function getAlignedX(
  text: string,
  font: PDFFont,
  size: number,
  align: 'left' | 'center' | 'right',
  cellX: number,
  colWidth: number,
  padding: number
): number {
  const textWidth = font.widthOfTextAtSize(text, size);
  if (align === 'center') return cellX + (colWidth - textWidth) / 2;
  if (align === 'right') return cellX + colWidth - textWidth - padding;
  return cellX + padding;
}

function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(test, fontSize);
      if (width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }

  return lines;
}

function toRGB(value: any): [number, number, number] | null {
  if (
    Array.isArray(value) &&
    value.length === 3 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    typeof value[2] === 'number'
  ) {
    return value as [number, number, number];
  }
  return null;
}
