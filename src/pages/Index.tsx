import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileBarChart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/UploadZone";
import PDFWorkspace from "@/components/PDFWorkspace";

type View = "upload" | "workspace";

const Index = () => {
  const [view, setView] = useState<View>("upload");
  const [fileName, setFileName] = useState("");

  const handleFileReady = (file: File) => {
    setFileName(file.name);
    // Short delay for the completion animation to play
    setTimeout(() => setView("workspace"), 600);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            {view === "workspace" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setView("upload")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5">
                <FileBarChart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">
                PDF Analytics
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {view === "workspace" ? "Workspace" : "Upload"}
            </span>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-6 py-8">
        <AnimatePresence mode="wait">
          {view === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center pt-16"
            >
              <motion.h1
                className="text-3xl font-bold text-foreground tracking-tight mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Upload & Analyze
              </motion.h1>
              <motion.p
                className="text-muted-foreground mb-10 text-center max-w-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Drop your PDF documents to extract insights, annotate data, and
                build your analytics workspace.
              </motion.p>
              <UploadZone onFileReady={handleFileReady} />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PDFWorkspace fileName={fileName} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
