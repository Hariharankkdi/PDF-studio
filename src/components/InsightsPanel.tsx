import { useState } from "react";
import { motion } from "framer-motion";
import {
  Highlighter,
  StickyNote,
  BoxSelect,
  Sparkles,
  Type,
  Eraser,
  Pen,
  Undo2,
  Redo2,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEditor, Tool } from "./EditorContext";
import { renderAnnotatedPDF, downloadPDF } from "./pdfExport";
import { toast } from "sonner";

interface InsightsPanelProps {
  file: File;
}

const InsightsPanel = ({ file }: InsightsPanelProps) => {
  const { activeTool, setActiveTool, activeColor, setActiveColor, undo, redo, canUndo, canRedo, actions } = useEditor();
  const [noteText, setNoteText] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const tools: { id: Tool; icon: typeof Pen; label: string }[] = [
    { id: "highlight", icon: Highlighter, label: "Highlight" },
    { id: "text", icon: Type, label: "Text" },
    { id: "draw", icon: Pen, label: "Draw" },
    { id: "note", icon: StickyNote, label: "Note" },
    { id: "select", icon: BoxSelect, label: "Select" },
    { id: "eraser", icon: Eraser, label: "Erase" },
  ];

  const annotationCount = actions.length;

  return (
    <div className="flex flex-col h-full border-l border-border bg-card/50 backdrop-blur-sm">
      {/* Edit Tools */}
      <div className="p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Edit Tools
        </p>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`text-xs gap-1.5 h-9 ${activeTool === tool.id ? "glow-primary-subtle" : ""}`}
            >
              <tool.icon className="h-3.5 w-3.5" />
              {tool.label}
            </Button>
          ))}
        </div>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            <p className="text-[11px] text-muted-foreground text-center">
              {activeTool === "draw" && "Click and drag to draw on the PDF"}
              {activeTool === "highlight" && "Click and drag to highlight an area"}
              {activeTool === "text" && "Click on the PDF to place text"}
              {activeTool === "note" && "Click on the PDF to add a sticky note"}
              {activeTool === "select" && "Click and drag to select a data region"}
              {activeTool === "eraser" && "Click on the PDF to erase the last annotation"}
            </p>
            {(activeTool === "text" || activeTool === "draw") && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-muted-foreground">Color:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { value: "hsl(215, 28%, 17%)", label: "Dark" },
                    { value: "hsl(0, 84%, 50%)", label: "Red" },
                    { value: "hsl(220, 90%, 50%)", label: "Blue" },
                    { value: "hsl(149, 100%, 33%)", label: "Green" },
                    { value: "hsl(25, 95%, 53%)", label: "Orange" },
                    { value: "hsl(270, 70%, 50%)", label: "Purple" },
                  ].map((c) => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => setActiveColor(c.value)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        activeColor === c.value ? "border-foreground scale-125" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Separator />

      {/* Undo / Redo */}
      <div className="flex items-center gap-2 p-3">
        <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1.5" onClick={undo} disabled={!canUndo}>
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1.5" onClick={redo} disabled={!canRedo}>
          <Redo2 className="h-3.5 w-3.5" />
          Redo
        </Button>
      </div>

      <Separator />

      {/* Annotation count */}
      <div className="px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {annotationCount} annotation{annotationCount !== 1 ? "s" : ""} added
        </p>
      </div>

      <Separator />

      {/* Notes area */}
      <div className="flex-1 p-3 flex flex-col">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Notes
        </p>
        <Textarea
          placeholder="Add notes about this document..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="flex-1 resize-none text-sm bg-background/50 min-h-[120px]"
        />
      </div>

      <Separator />

      {/* Actions */}
      <div className="p-3 space-y-2">
        <Button
          variant="outline"
          className="w-full text-sm gap-2"
          disabled={isExporting}
          onClick={async () => {
            setIsExporting(true);
            try {
              const bytes = await renderAnnotatedPDF(file, actions);
              const name = file.name.replace(/\.pdf$/i, "") + "_annotated.pdf";
              downloadPDF(bytes, name);
              toast.success("PDF exported successfully!");
            } catch (err) {
              console.error(err);
              toast.error("Failed to export PDF");
            } finally {
              setIsExporting(false);
            }
          }}
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting…" : "Export PDF"}
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full glow-primary-subtle font-semibold gap-2"
            disabled={isExporting || actions.length === 0}
            onClick={async () => {
              setIsExporting(true);
              try {
                const bytes = await renderAnnotatedPDF(file, actions);
                const name = file.name.replace(/\.pdf$/i, "") + "_annotated.pdf";
                downloadPDF(bytes, name);
                toast.success("Changes saved and downloaded!");
              } catch (err) {
                console.error(err);
                toast.error("Failed to save changes");
              } finally {
                setIsExporting(false);
              }
            }}
          >
            <Sparkles className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPanel;
