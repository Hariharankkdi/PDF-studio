import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "analyzing" | "complete";
}

interface UploadZoneProps {
  onFileReady: (file: File) => void;
}

const UploadZone = ({ onFileReady }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (file: File) => {
      const id = crypto.randomUUID();
      const newFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
      };

      setFiles((prev) => [...prev, newFile]);

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, progress: 100, status: "analyzing" } : f
            )
          );
          // Analyzing phase
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: "complete" } : f
              )
            );
            onFileReady(file);
          }, 1500);
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress } : f))
          );
        }
      }, 200);
    },
    [onFileReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "application/pdf"
      );
      droppedFiles.forEach(simulateUpload);
    },
    [simulateUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      selected.forEach(simulateUpload);
    },
    [simulateUpload]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-12
          transition-colors duration-300 glass-card
          ${
            isDragging
              ? "border-primary bg-accent"
              : "border-border hover:border-primary/50"
          }
        `}
        animate={
          isDragging
            ? {
                scale: 1.02,
                boxShadow: "0 0 30px hsl(149 100% 33% / 0.25)",
              }
            : { scale: 1, boxShadow: "0 0 0px transparent" }
        }
        whileHover={{
          animation: "breathing 2s ease-in-out infinite",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            className="rounded-2xl bg-accent p-4"
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Upload className="h-8 w-8 text-primary" />
          </motion.div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Drop your PDF here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse · PDF files only
            </p>
          </div>
        </div>

        {/* Animated border pulse when dragging */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-accent p-2.5">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)} ·{" "}
                  {file.status === "uploading" && "Uploading..."}
                  {file.status === "analyzing" && "Analyzing document..."}
                  {file.status === "complete" && "Ready"}
                </p>
              </div>
              <div className="flex-shrink-0">
                {file.status === "complete" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </motion.div>
                ) : (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {file.status !== "complete" && (
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    file.status === "analyzing"
                      ? "liquid-gradient"
                      : "bg-primary"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${file.progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UploadZone;
