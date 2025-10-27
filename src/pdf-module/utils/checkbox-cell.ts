import { PDFPage, PDFFont, rgb } from 'pdf-lib';

export function renderCheckboxCell(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  value: { checked: boolean; label: string },
  font: PDFFont,
  fontSize: number
) {
  const boxSize = Math.min(12, height - 6);
  const boxX = x + 4;
  const boxY = y + (height - boxSize) / 2;

  // Dibuja el recuadro del checkbox
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxSize,
    height: boxSize,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  // Si está marcado, dibuja una “X”
  if (value.checked) {
    page.drawLine({
      start: { x: boxX, y: boxY },
      end: { x: boxX + boxSize, y: boxY + boxSize },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: boxX + boxSize, y: boxY },
      end: { x: boxX, y: boxY + boxSize },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  // Texto del label
  const labelX = boxX + boxSize + 4;
  const labelY = y + (height - fontSize) / 2;

  page.drawText(value.label, {
    x: labelX,
    y: labelY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}
