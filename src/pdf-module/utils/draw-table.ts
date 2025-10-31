import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';

export interface CheckboxOption {
  label: string;
  checked: boolean;
}

export type CellElement =
  | { type: 'text'; value: string; fontSize?: number; color?: [number, number, number]; bold?:boolean; inline?: boolean; }
  | { type: 'checkbox'; label: string; checked?: boolean; fontSize?: number }
  | { type: 'image'; bytes: Uint8Array; width?: number; height?: number; }
  | { type: 'space'; width: number }
  | { type: 'newline' };

export interface CellContainer {
  type: 'container';
  elements: CellElement[];
  width?: number;
  height?: number;
  backgroundColor?: [number, number, number];
  borderColor?: [number, number, number];
  borderWidth?: number;
  gap?: number;
  horizontalGap?: number; // horizontal
  padding?: { top?: number; left?: number; bottom?: number; right?: number };
  align?: 'left' | 'center' | 'right';
}

export interface DrawTableOptions {
  pdfDoc: PDFDocument;
  page: PDFPage;
  headers?: string[];
  rows: (string | number | null | CellContainer)[][];
  font: PDFFont;
  fontBold?: PDFFont;
  fontSize?: number;
  headerFontSize?: number;
  headerFont?: PDFFont;
  marginX?: number;
  marginY?: number;
  columnWeights?: number[];
  startY?: number;
  rowPadding?: number;
  align?: ('left' | 'center' | 'right') | ('left' | 'center' | 'right')[];
  columnPadding?: number;
  headerColors?: (string | [number, number, number])[] | [number, number, number];
  hideHeader?: boolean;
  onCreateNewPage?: () => PDFPage | Promise<PDFPage>;
  onCreateNewPageStartY?: (page: PDFPage) => number; 
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
    headerColors = [0.9, 0.9, 0.9],
    onCreateNewPage,

  } = options;

  let currentPage = page;
  const pageWidth = currentPage.getWidth();
  const pageHeight = currentPage.getHeight();
  const tableWidth = pageWidth - marginX * 2;

  const totalWeight = columnWeights?.reduce((a, b) => a + b, 0) || (headers.length || (rows[0]?.length ?? 1));
  const columnWidths =
    columnWeights?.map((w) => (w / totalWeight) * tableWidth) ||
    Array(headers.length || (rows[0]?.length ?? 1)).fill(tableWidth / (headers.length || (rows[0]?.length ?? 1)));

  let cursorY = startY ?? pageHeight - marginY;

  async function ensureSpace(height: number) {

    if (cursorY - height < marginY) {
      const newPage = onCreateNewPage ? await onCreateNewPage() : pdfDoc.addPage([pageWidth, pageHeight]);
      currentPage = newPage;
      cursorY = options.onCreateNewPageStartY ? options.onCreateNewPageStartY(newPage) : pageHeight - marginY;

      if (headers.length > 0 && !options.hideHeader) await drawHeader(currentPage, headers);
    }
  }

  async function drawHeader(pageRef: PDFPage, headersArr: string[]) {
    const headerHeight = 25;
    let cellX = marginX;
    const headerY = cursorY;

    for (let i = 0; i < headersArr.length; i++) {
      const colWidth = columnWidths[i];
      const sizeHeader = headerFontSize;
      const alignType = Array.isArray(align) ? align[i] || 'center' : (align as any) || 'center';
      const padding = columnPadding;
      const colorArr = safeRGB(Array.isArray(headerColors) && Array.isArray(headerColors[i]) ? headerColors[i] : headerColors) ?? [0.9, 0.9, 0.9];

      pageRef.drawRectangle({
        x: cellX,
        y: headerY - headerHeight,
        width: colWidth,
        height: headerHeight,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
        color: rgb(...colorArr),
      });

      const text = headersArr[i]?.toString() ?? '';
      const wrappedLines = wrapText(text, colWidth - 2 * padding, font, sizeHeader);
      let textY = headerY - (headerHeight - wrappedLines.length * (sizeHeader + 2)) / 2 - sizeHeader;
      const textColorArr: [number, number, number] = [0, 0, 0];
      const headerFontToUse = options.headerFont || font;
      for (const line of wrappedLines) {
        const textX = getAlignedX(line, headerFontToUse, sizeHeader, alignType, cellX, colWidth, padding);
        safeDrawText(pageRef, line, textX, textY, sizeHeader, headerFontToUse, textColorArr);
        textY -= sizeHeader + 2;
      }

      cellX += colWidth;
    }
    cursorY -= headerHeight;
  }

  if (headers.length > 0 && !options.hideHeader) await drawHeader(currentPage, headers);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
  const row = rows[rowIndex];

  // CALCULAR ALTURA DINÁMICA DE FILA
  let maxRowHeight = 0;
  for (let colIndex = 0; colIndex < row.length; colIndex++) {
    const rawCell = row[colIndex];
    const colWidth = columnWidths[colIndex];
    let cellHeight = 0;

    if (typeof rawCell === 'object' && rawCell?.type === 'container') {
      // Calcular altura del contenedor según sus elementos
      const container = rawCell as CellContainer;
      const paddingTop = container.padding?.top ?? rowPadding;
      const paddingBottom = container.padding?.bottom ?? rowPadding;
      const paddingLeft = container.padding?.left ?? columnPadding;
      const gap = container.gap ?? 4;
      let totalContentHeight = 0;

      for (const el of container.elements) {
        switch (el.type) {
          case 'text': {
            const size = el.fontSize ?? fontSize;
            const paragraphs = el.value.split('\n');
            let lines = 0;
            for (const para of paragraphs) {
              const wrapped = wrapText(para, colWidth - 2 * paddingLeft, font, size);
              lines += wrapped.length;
            }
            totalContentHeight += lines * (size + 2) + gap;
            break;
          }
          case 'checkbox':
            totalContentHeight += 16 + gap;
            break;
          case 'image':
            totalContentHeight += (el.height ?? 50) + gap;
            break;
        }
      }

      cellHeight = paddingTop + totalContentHeight + paddingBottom;
    } else {
      // Celda de texto normal
      const text = (rawCell ?? '').toString();
      const wrappedLines = wrapText(text, colWidth - 2 * columnPadding, font, fontSize);
      cellHeight = wrappedLines.length * (fontSize + 2) + 8;
    }

    maxRowHeight = Math.max(maxRowHeight, cellHeight);
  }

  // Usa la altura real calculada
  const rowHeight = maxRowHeight;

  await ensureSpace(rowHeight);

  let cellX = marginX;
  for (let colIndex = 0; colIndex < row.length; colIndex++) {
    const rawCell = row[colIndex];
    const colWidth = columnWidths[colIndex];

    let bgRgb: [number, number, number] = [1, 1, 1];
    let borderRgb: [number, number, number] = [0, 0, 0];
    let borderWidth = 1;

    if (typeof rawCell === 'object' && rawCell?.type === 'container') {
      const container = rawCell as CellContainer;
      bgRgb = safeRGB(container.backgroundColor) ?? bgRgb;
      borderRgb = safeRGB(container.borderColor) ?? borderRgb;
      borderWidth = container.borderWidth ?? borderWidth;

      currentPage.drawRectangle({
        x: cellX,
        y: cursorY - rowHeight,
        width: container.width ?? colWidth,
        height: rowHeight,
        borderWidth,
        borderColor: rgb(...borderRgb),
        color: rgb(...bgRgb),
      });

      const paddingTop = container.padding?.top ?? rowPadding;
      const paddingLeft = container.padding?.left ?? columnPadding;
      const gap = container.gap ?? 4;

      let cursorContentY = cursorY - paddingTop;
      let cursorContentX = cellX + paddingLeft;
      const lineHeight = 14;
      const checkboxHeight = 12;

      for (const el of container.elements) {
        switch (el.type) {
          case 'text': {
            const size = el.fontSize ?? fontSize;
            const color: [number, number, number] = safeRGB(el.color) ?? [0, 0, 0];
            const horizontalGap = container.horizontalGap ?? 4;

            if ((el as any).inline) {
              safeDrawText(currentPage, el.value, cursorContentX, cursorContentY - size, size, font, color);
              const textWidth = font.widthOfTextAtSize(el.value, size);
              cursorContentX += textWidth + horizontalGap;
            } else {
              const paragraphs = el.value.split('\n');
              for (const para of paragraphs) {
                const wrapped = wrapText(para, colWidth - 2 * paddingLeft, font, size);
                for (const line of wrapped) {
                  const textX = getAlignedX(line, font, size, container.align ?? 'left', cellX, colWidth, paddingLeft);
                  //safeDrawText(currentPage, line, textX, cursorContentY - size, size, font, color);
                  let usedFont = font;
                  if (el.bold && (pdfDoc as any).boldFont) {
                    usedFont = (pdfDoc as any).boldFont;
                  }
                  safeDrawText(currentPage, line, textX, cursorContentY - size, size, usedFont, color);
                  cursorContentY -= size + 2;
                }
              }
              cursorContentX = cellX + paddingLeft;
              cursorContentY -= gap + 10;
            }
            break;
          }

          case 'checkbox': {
            const boxSize = 12;
            const horizontalGap = container.horizontalGap ?? 6;
            drawCheckbox(currentPage, cursorContentX, cursorContentY - boxSize, boxSize, el.checked);
            const labelX = cursorContentX + boxSize + 3;
            safeDrawText(currentPage, el.label, labelX, cursorContentY - boxSize + 1, el.fontSize ?? fontSize, font, [0, 0, 0]);
            const labelWidth = font.widthOfTextAtSize(el.label, el.fontSize ?? fontSize);
            cursorContentX += boxSize + labelWidth + horizontalGap;
            break;
          }

          case 'image': {
            const imgWidth = el.width ?? 50;
            const imgHeight = el.height ?? 50;
            const img = await pdfDoc.embedJpg?.(el.bytes) ?? await pdfDoc.embedPng(el.bytes);
            currentPage.drawImage(img, {
              x: cursorContentX,
              y: cursorContentY - imgHeight,
              width: imgWidth,
              height: imgHeight,
            });
            cursorContentX += imgWidth + (container.gap ?? 6);
            break;
          }

          case 'space': {
            cursorContentX += el.width;
            break;
          }

          case 'newline': {
            cursorContentX = cellX + paddingLeft;
            cursorContentY -= lineHeight + (container.gap ?? 4);
            break;
          }
        }
      }

    } else {
      const text = (rawCell ?? '').toString();
      const wrappedLines = wrapText(text, colWidth - 2 * columnPadding, font, fontSize);
      let textY = cursorY - (rowHeight - wrappedLines.length * (fontSize + 2)) / 2 - fontSize;
      const textColorArr: [number, number, number] = [0, 0, 0];

      for (const line of wrappedLines) {
        const textX = getAlignedX(line, font, fontSize, 'left', cellX, colWidth, columnPadding);
        safeDrawText(currentPage, line, textX, textY, fontSize, font, textColorArr);
        textY -= fontSize + 2;
      }

      currentPage.drawRectangle({
        x: cellX,
        y: cursorY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderWidth,
        borderColor: rgb(...borderRgb),
        color: rgb(...bgRgb),
      });
    }

    cellX += colWidth;
  }

  //mover cursorY al final de la fila
  cursorY -= rowHeight;
}

  return { endY: cursorY, lastPage: currentPage };
}

// ====== UTILIDADES ======

function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
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

function safeRGB(value: any): [number, number, number] | null {
  if (Array.isArray(value) && value.length === 3 && value.every((v) => typeof v === 'number')) return value as [number, number, number];
  return null;
}

function getAlignedX(text: string, font: PDFFont, size: number, align: 'left' | 'center' | 'right', cellX: number, colWidth: number, padding: number): number {
  const textWidth = font.widthOfTextAtSize(text ?? '', size);
  if (align === 'center') return cellX + (colWidth - textWidth) / 2;
  if (align === 'right') return cellX + colWidth - textWidth - padding;
  return cellX + padding;
}

function safeDrawText(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color: [number, number, number] = [0, 0, 0]) {
  const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
  const safeY = typeof y === 'number' && !isNaN(y) ? y : 0;
  const safeSize = typeof size === 'number' ? size : 10;
  const safeColor = safeRGB(color) ?? [0, 0, 0];
  page.drawText(text ?? '', { x: safeX, y: safeY, size: safeSize, font, color: rgb(...safeColor) });
}

function drawCheckbox(page: PDFPage, x: number, y: number, size: number, checked?: boolean) {
  page.drawRectangle({ x, y, width: size, height: size, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  if (checked) {
    page.drawLine({ start: { x: x + 2, y: y + 2 }, end: { x: x + size - 2, y: y + size - 2 }, thickness: 1, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: x + size - 2, y: y + 2 }, end: { x: x + 2, y: y + size - 2 }, thickness: 1, color: rgb(0, 0, 0) });
  }
}


function calculateContainerHeight(container: CellContainer, font: PDFFont, fontSize: number, colWidth: number): number {
  const paddingTop = container.padding?.top ?? 4;
  const paddingLeft = container.padding?.left ?? 4;
  const gap = container.gap ?? 4;
  let height = paddingTop + 4;

  for (const el of container.elements) {
    switch (el.type) {
      case 'text': {
        const size = el.fontSize ?? fontSize;
        const lines = wrapText(el.value, colWidth - 2 * paddingLeft, font, size);
        height += lines.length * (size + 2);
        break;
      }
      case 'checkbox':
        height += 14 + gap;
        break;
      case 'image':
        height += (el.height ?? 50) + gap;
        break;
      case 'newline':
        height += 12;
        break;
    }
  }

  height += paddingTop;
  return height;
}
