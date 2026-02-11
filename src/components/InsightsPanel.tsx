import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Highlighter,
  StickyNote,
  BoxSelect,
  Sparkles,
  MessageSquare,
  TrendingUp,
  FileBarChart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tool = "highlight" | "note" | "select" | null;

interface Annotation {
  id: string;
  type: "highlight" | "note" | "extraction";
  content: string;
  page: number;
  timestamp: Date;
}

const InsightsPanel = () => {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: "1",
      type: "highlight",
      content: "Revenue increased by 23% in Q3 2025",
      page: 1,
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "extraction",
      content: "Table: Regional Sales Breakdown",
      page: 2,
      timestamp: new Date(),
    },
  ]);

  const tools = [
    { id: "highlight" as Tool, icon: Highlighter, label: "Highlight" },
    { id: "note" as Tool, icon: StickyNote, label: "Note" },
    { id: "select" as Tool, icon: BoxSelect, label: "Extract" },
  ];

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col h-full border-l border-border bg-card/50 backdrop-blur-sm">
      {/* Tools */}
      <div className="border-b border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Tools
        </p>
        <div className="flex gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setActiveTool((t) => (t === tool.id ? null : tool.id))
              }
              className={`flex-1 text-xs gap-1.5 ${
                activeTool === tool.id ? "glow-primary-subtle" : ""
              }`}
            >
              <tool.icon className="h-3.5 w-3.5" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="border-b border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Auto Insights
        </p>
        <div className="space-y-2">
          {[
            { icon: TrendingUp, text: "3 growth trends detected", color: "text-primary" },
            { icon: FileBarChart, text: "2 data tables found", color: "text-primary" },
            { icon: Sparkles, text: "5 key metrics identified", color: "text-primary" },
          ].map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2.5 rounded-lg bg-accent/50 px-3 py-2"
            >
              <insight.icon className={`h-3.5 w-3.5 ${insight.color}`} />
              <span className="text-xs text-foreground">{insight.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Annotations */}
      <div className="flex-1 overflow-auto p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Annotations
        </p>
        <AnimatePresence>
          {annotations.map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-2 rounded-lg border border-border bg-card p-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {ann.type === "highlight" && (
                    <Highlighter className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  )}
                  {ann.type === "note" && (
                    <MessageSquare className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  )}
                  {ann.type === "extraction" && (
                    <BoxSelect className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">{ann.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Page {ann.page}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeAnnotation(ann.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Finish Button */}
      <div className="border-t border-border p-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full glow-primary-subtle font-semibold">
            <Sparkles className="h-4 w-4 mr-2" />
            Finish Analysis
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPanel;
