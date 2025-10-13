import { PDFDocument, PDFPage, PDFFont, rgb, PDFImage } from 'pdf-lib';

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
  images?: (Uint8Array | null)[][];
  headerColors?: (string | [number, number, number])[] | [number, number, number];

  headerTextColors?: (string | [number, number, number])[] | [number, number, number];
  rowTextColors?: ((string | [number, number, number])[] | [number, number, number])[];
  headerFontWeights?: ('normal' | 'bold')[];
  rowFontWeights?: (('normal' | 'bold')[] | 'normal' | 'bold')[];
  cellBackgroundColors?: (([number, number, number] | null)[] | [number, number, number] | null)[];
  cellBorderColors?: (([number, number, number] | null)[] | [number, number, number] | null)[];
  cellBorderWidths?: (number[] | number)[];
  hideHeader?: boolean; 
}

export async function drawTable(options: DrawTableOptions) {
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
  } = options;

  const pageWidth = page.getWidth();
  const usableWidth = pageWidth - marginX * 2;
  const tableWidth = usableWidth;

  const totalWeight =
    columnWeights?.reduce((sum, w) => sum + w, 0) || headers.length || rows[0].length;
  const columnWidths =
    columnWeights?.map((w) => (w / totalWeight) * tableWidth) ||
    Array(headers.length || rows[0].length).fill(
      tableWidth / (headers.length || rows[0].length)
    );

  let cursorY = startY ?? page.getHeight() - marginY;

  // === ENCABEZADOS ===
  if (headers.length > 0 && !options.hideHeader) {
    const headerHeight = 25;
    let cellX = marginX;
    const headerY = cursorY;

    for (let i = 0; i < headers.length; i++) {
      const colWidth = columnWidths[i];
      const text = headers[i]?.toString() ?? '';
      const sizeHeader = options.headerFontSizes?.[i] ?? headerFontSize ?? fontSize;
      const alignType = Array.isArray(align) ? align[i] || 'center' : align || 'center';
      const padding = columnPadding;

      // Color del fondo del header
      const color =
        Array.isArray(headerColors) && typeof headerColors[0] !== 'number'
          ? headerColors[i] || [0.9, 0.9, 0.9]
          : headerColors;
      const rgbColor =
        Array.isArray(color) &&
        color.length === 3 &&
        typeof color[0] === 'number' &&
        typeof color[1] === 'number' &&
        typeof color[2] === 'number'
          ? rgb(color[0], color[1], color[2])
          : rgb(0.9, 0.9, 0.9);

      // Fondo del header
      page.drawRectangle({
        x: cellX,
        y: headerY - headerHeight,
        width: colWidth,
        height: headerHeight,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
        color: rgbColor,
      });

      // Imagen o texto
      const imageData = images?.[0]?.[i];
      if (imageData) {
        const embeddedImage = await embedImage(pdfDoc, imageData);
        const scale = Math.min(
          (colWidth - 2 * padding) / embeddedImage.width,
          (headerHeight - 2 * padding) / embeddedImage.height
        );
        const imgWidth = embeddedImage.width * scale;
        const imgHeight = embeddedImage.height * scale;
        const imgX = cellX + (colWidth - imgWidth) / 2;
        const imgY = headerY - headerHeight + (headerHeight - imgHeight) / 2;

        page.drawImage(embeddedImage, {
          x: imgX,
          y: imgY,
          width: imgWidth,
          height: imgHeight,
        });
      } else {
        // Color del texto del header
        const textColorValue =
          Array.isArray(options.headerTextColors) && typeof options.headerTextColors[0] !== 'number'
            ? options.headerTextColors[i] || [0, 0, 0]
            : options.headerTextColors || [0, 0, 0];
        const textRgbColor = Array.isArray(textColorValue) && typeof textColorValue[0] === 'number'
          ? rgb(
              Number(textColorValue[0]),
              Number(textColorValue[1]),
              Number(textColorValue[2])
            )
          : rgb(0, 0, 0);

        const fontWeight = options.headerFontWeights?.[i] === 'bold' ? 'bold' : 'normal';
        const wrappedLines = wrapText(text, colWidth - 2 * padding, font, sizeHeader);
        const totalTextHeight = wrappedLines.length * (sizeHeader + 2);
        const textStartY = headerY - (headerHeight - totalTextHeight) / 2 - sizeHeader;
        let textY = textStartY;

        wrappedLines.forEach((line) => {
          const textX = getAlignedX(line, font, sizeHeader, alignType, cellX, colWidth, padding);
          if (fontWeight === 'bold') {
            page.drawText(line, {
              x: textX + 0.3,
              y: textY,
              size: sizeHeader,
              font,
              color: textRgbColor,
            });
          }
          page.drawText(line, {
            x: textX,
            y: textY,
            size: sizeHeader,
            font,
            color: textRgbColor,
          });
          textY -= sizeHeader + 2;
        });
      }

      cellX += colWidth;
    }

    cursorY -= headerHeight;
  }

  // === FILAS ===
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowHeight = 40;
    let cellX = marginX;

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const text = row[colIndex] != null ? row[colIndex]!.toString() : '';
      const sizeCell =
        options.cellFontSizes?.[rowIndex]?.[colIndex] ??
        options.columnFontSizes?.[colIndex] ??
        fontSize;
      const alignType = Array.isArray(align) ? align[colIndex] || 'left' : align || 'left';
      const padding = columnPadding;
      const colWidth = columnWidths[colIndex];


      const bgColorValue =
        Array.isArray(options.cellBackgroundColors?.[rowIndex]) &&
        Array.isArray(options.cellBackgroundColors?.[rowIndex]?.[colIndex])
          ? options.cellBackgroundColors?.[rowIndex]?.[colIndex]
          : Array.isArray(options.cellBackgroundColors?.[rowIndex])
          ? null
          : options.cellBackgroundColors?.[rowIndex] || null;

      const borderColorValue =
        Array.isArray(options.cellBorderColors?.[rowIndex]) &&
        Array.isArray(options.cellBorderColors?.[rowIndex]?.[colIndex])
          ? options.cellBorderColors?.[rowIndex]?.[colIndex]
          : Array.isArray(options.cellBorderColors?.[rowIndex])
          ? null
          : options.cellBorderColors?.[rowIndex] || [0, 0, 0];

      const borderWidthValue = Array.isArray(options.cellBorderWidths?.[rowIndex])
        ? options.cellBorderWidths?.[rowIndex]?.[colIndex] ?? 1
        : (options.cellBorderWidths?.[rowIndex] as number) ?? 1;

      const bgRgb =
        Array.isArray(bgColorValue) &&
        bgColorValue.length === 3 &&
        typeof bgColorValue[0] === 'number' &&
        typeof bgColorValue[1] === 'number' &&
        typeof bgColorValue[2] === 'number'
          ? rgb(bgColorValue[0], bgColorValue[1], bgColorValue[2])
          : undefined;
      const borderRgb =
        Array.isArray(borderColorValue) &&
        borderColorValue.length === 3 &&
        typeof borderColorValue[0] === 'number' &&
        typeof borderColorValue[1] === 'number' &&
        typeof borderColorValue[2] === 'number'
          ? rgb(borderColorValue[0], borderColorValue[1], borderColorValue[2])
          : rgb(0, 0, 0);


      page.drawRectangle({
        x: cellX,
        y: cursorY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderWidth: borderWidthValue,
        borderColor: borderRgb,
        color: bgRgb,
      });


      const imageData = images?.[rowIndex + 1]?.[colIndex];
      if (imageData) {
        const embeddedImage = await embedImage(pdfDoc, imageData);
        const scale = Math.min(
          (colWidth - 2 * padding) / embeddedImage.width,
          (rowHeight - 2 * padding) / embeddedImage.height
        );
        const imgWidth = embeddedImage.width * scale;
        const imgHeight = embeddedImage.height * scale;
        const imgX = cellX + (colWidth - imgWidth) / 2;
        const imgY = cursorY - rowHeight + (rowHeight - imgHeight) / 2;

        page.drawImage(embeddedImage, {
          x: imgX,
          y: imgY,
          width: imgWidth,
          height: imgHeight,
        });
      } else {

        const wrappedLines = wrapText(text, colWidth - 2 * padding, font, sizeCell);
        const totalTextHeight = wrappedLines.length * (sizeCell + 2);
        let textY = cursorY - (rowHeight - totalTextHeight) / 2 - sizeCell - rowPadding;

        const textColorValue =
          Array.isArray(options.rowTextColors?.[rowIndex]) &&
          typeof options.rowTextColors?.[rowIndex]?.[colIndex] !== 'number'
            ? options.rowTextColors?.[rowIndex]?.[colIndex] || [0, 0, 0]
            : options.rowTextColors?.[rowIndex] || [0, 0, 0];
        const textRgbColor = Array.isArray(textColorValue) &&
          typeof textColorValue[0] === 'number' &&
          typeof textColorValue[1] === 'number' &&
          typeof textColorValue[2] === 'number'
          ? rgb(
              Number(textColorValue[0]),
              Number(textColorValue[1]),
              Number(textColorValue[2])
            )
          : rgb(0, 0, 0);


        let fontWeight: 'normal' | 'bold' = 'normal';
        if (Array.isArray(options.rowFontWeights)) {
          const rowWeights = options.rowFontWeights[rowIndex];
          if (Array.isArray(rowWeights)) {
            fontWeight = rowWeights[colIndex] || 'normal';
          } else if (typeof rowWeights === 'string') {
            fontWeight = rowWeights;
          }
        }

        wrappedLines.forEach((line) => {
          const textX = getAlignedX(line, font, sizeCell, alignType, cellX, colWidth, padding);
          if (fontWeight === 'bold') {
            page.drawText(line, {
              x: textX + 0.3,
              y: textY,
              size: sizeCell,
              font,
              color: textRgbColor,
            });
          }
          page.drawText(line, {
            x: textX,
            y: textY,
            size: sizeCell,
            font,
            color: textRgbColor,
          });
          textY -= sizeCell + 2;
        });
      }

      cellX += colWidth;
    }

    cursorY -= 40;
  }
}

async function embedImage(pdfDoc: PDFDocument, data: Uint8Array): Promise<PDFImage> {
  try {
    return await pdfDoc.embedPng(data);
  } catch {
    return await pdfDoc.embedJpg(data);
  }
}

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
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}
