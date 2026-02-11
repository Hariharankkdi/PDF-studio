import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  fileName: string;
}

const PDFViewer = ({ fileName }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 5; // Simulated

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card/80 backdrop-blur-sm">
        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
          {fileName}
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
            {page} / {totalPages}
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
          className="bg-card rounded-lg shadow-lg border border-border"
          style={{
            width: `${(595 * zoom) / 100}px`,
            minHeight: `${(842 * zoom) / 100}px`,
            transform: `scale(1)`,
          }}
        >
          {/* Simulated PDF content */}
          <div className="p-8 space-y-4" style={{ fontSize: `${(14 * zoom) / 100}px` }}>
            <div className="h-6 rounded bg-muted/60 w-3/4" />
            <div className="h-4 rounded bg-muted/40 w-full" />
            <div className="h-4 rounded bg-muted/40 w-5/6" />
            <div className="h-4 rounded bg-muted/40 w-4/5" />
            <div className="h-20 rounded bg-muted/30 w-full mt-6" />
            <div className="h-4 rounded bg-muted/40 w-full" />
            <div className="h-4 rounded bg-muted/40 w-3/4" />
            <div className="h-4 rounded bg-muted/40 w-5/6" />
            <div className="h-32 rounded bg-accent/50 w-full mt-6 border border-primary/20 flex items-center justify-center">
              <span className="text-xs text-primary font-medium">
                Chart / Data Area — Page {page}
              </span>
            </div>
            <div className="h-4 rounded bg-muted/40 w-full" />
            <div className="h-4 rounded bg-muted/40 w-2/3" />
            <div className="h-4 rounded bg-muted/40 w-4/5" />
            <div className="h-4 rounded bg-muted/40 w-1/2" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFViewer;
