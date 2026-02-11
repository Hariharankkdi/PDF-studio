import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fileUrl = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card/80 backdrop-blur-sm">
        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
          {file.name}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center font-mono">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {page} / {totalPages || "–"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document area */}
      <div className="flex-1 overflow-auto grid-pattern p-8 flex items-start justify-center">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
            loading={
              <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
                Loading PDF…
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96 text-destructive text-sm">
                Failed to load PDF
              </div>
            }
          >
            <Page
              pageNumber={page}
              scale={zoom / 100}
              className="shadow-lg rounded-lg overflow-hidden"
              loading={
                <div className="flex items-center justify-center h-96 w-[595px] bg-card text-muted-foreground text-sm">
                  Loading page…
                </div>
              }
            />
          </Document>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFViewer;
