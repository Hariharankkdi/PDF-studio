import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { DrawAction } from "./EditorContext";

/**
 * Renders all annotations onto the PDF and returns the modified PDF bytes.
 */
export async function renderAnnotatedPDF(
  file: File,
  actions: DrawAction[]
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  actions.forEach((action) => {
    const pageIndex = action.page - 1; // actions use 1-based page numbers
    if (pageIndex < 0 || pageIndex >= pages.length) return;
    const pdfPage = pages[pageIndex];
    const { height: pageHeight } = pdfPage.getSize();

    if (action.tool === "draw" && action.points && action.points.length > 1) {
      // Draw freehand strokes as thin lines between consecutive points
      for (let i = 1; i < action.points.length; i++) {
        const from = action.points[i - 1];
        const to = action.points[i];
        // pdf-lib doesn't have lineTo natively, so we draw tiny rectangles
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.5) continue;

        // Draw a thin rectangle along the line segment
        const angle = Math.atan2(dy, dx);
        const thickness = 2;

        pdfPage.drawLine({
          start: { x: from.x, y: pageHeight - from.y },
          end: { x: to.x, y: pageHeight - to.y },
          thickness,
          color: rgb(0, 0.65, 0.33),
        });
      }
    }

    if (action.tool === "highlight" && action.rect) {
      const { x, y, w, h } = action.rect;
      pdfPage.drawRectangle({
        x,
        y: pageHeight - y - h,
        width: w,
        height: h,
        color: rgb(0, 0.65, 0.33),
        opacity: 0.25,
      });
    }

    if (action.tool === "select" && action.rect) {
      const { x, y, w, h } = action.rect;
      pdfPage.drawRectangle({
        x,
        y: pageHeight - y - h,
        width: w,
        height: h,
        borderColor: rgb(0, 0.65, 0.33),
        borderWidth: 2,
        opacity: 0,
      });
    }

    if (action.tool === "text" && action.text && action.textPos) {
      pdfPage.drawText(action.text, {
        x: action.textPos.x,
        y: pageHeight - action.textPos.y,
        size: 14,
        font,
        color: rgb(0.13, 0.17, 0.23),
      });
    }

    if (action.tool === "note" && action.textPos) {
      const nx = action.textPos.x;
      const ny = action.textPos.y;
      // Draw note background
      pdfPage.drawRectangle({
        x: nx,
        y: pageHeight - ny - 60,
        width: 120,
        height: 60,
        color: rgb(1, 0.93, 0.6),
        borderColor: rgb(0.9, 0.8, 0.4),
        borderWidth: 1,
      });
      if (action.text) {
        pdfPage.drawText(action.text, {
          x: nx + 6,
          y: pageHeight - ny - 16,
          size: 11,
          font,
          color: rgb(0.13, 0.17, 0.23),
          maxWidth: 110,
        });
      }
    }
  });

  return pdfDoc.save();
}

/**
 * Triggers a browser download of the given bytes as a PDF file.
 */
export function downloadPDF(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
