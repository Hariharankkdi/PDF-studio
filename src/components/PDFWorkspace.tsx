import { motion } from "framer-motion";
import PDFViewer from "./PDFViewer";
import InsightsPanel from "./InsightsPanel";

interface PDFWorkspaceProps {
  file: File;
}

const PDFWorkspace = ({ file }: PDFWorkspaceProps) => {
  return (
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
        <InsightsPanel />
      </div>
    </motion.div>
  );
};

export default PDFWorkspace;
