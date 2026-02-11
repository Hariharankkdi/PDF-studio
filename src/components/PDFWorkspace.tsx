import { motion } from "framer-motion";
import PDFViewer from "./PDFViewer";
import InsightsPanel from "./InsightsPanel";
import { EditorProvider } from "./EditorContext";

interface PDFWorkspaceProps {
  file: File;
}

const PDFWorkspace = ({ file }: PDFWorkspaceProps) => {
  return (
    <EditorProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex h-[calc(100vh-120px)] rounded-2xl border border-border overflow-hidden glass-card"
      >
        <div className="flex-1 min-w-0">
          <PDFViewer file={file} />
        </div>
        <div className="w-72 flex-shrink-0">
          <InsightsPanel file={file} />
        </div>
      </motion.div>
    </EditorProvider>
  );
};

export default PDFWorkspace;
