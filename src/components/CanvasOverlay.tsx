import { useRef, useState, useCallback, useEffect } from "react";
import { useEditor, DrawAction } from "./EditorContext";

interface CanvasOverlayProps {
  page: number;
  width: number;
  height: number;
}

const CanvasOverlay = ({ page, width, height }: CanvasOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeTool, actions, addAction } = useEditor();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [textValue, setTextValue] = useState("");

  const pageActions = actions.filter((a) => a.page === page);

  // Redraw all actions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    pageActions.forEach((action) => {
      if (action.tool === "draw" && action.points && action.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = action.color || "hsl(149, 100%, 33%)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }

      if (action.tool === "highlight" && action.rect) {
        ctx.fillStyle = "hsla(149, 100%, 33%, 0.25)";
        ctx.fillRect(action.rect.x, action.rect.y, action.rect.w, action.rect.h);
        ctx.strokeStyle = "hsla(149, 100%, 33%, 0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(action.rect.x, action.rect.y, action.rect.w, action.rect.h);
      }

      if (action.tool === "select" && action.rect) {
        ctx.strokeStyle = "hsl(149, 100%, 33%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(action.rect.x, action.rect.y, action.rect.w, action.rect.h);
        ctx.setLineDash([]);
      }

      if (action.tool === "text" && action.text && action.textPos) {
        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "hsl(215, 28%, 17%)";
        ctx.fillText(action.text, action.textPos.x, action.textPos.y);
      }

      if (action.tool === "note" && action.textPos) {
        // Draw sticky note icon
        const x = action.textPos.x;
        const y = action.textPos.y;
        ctx.fillStyle = "hsl(45, 100%, 80%)";
        ctx.fillRect(x, y, 120, 60);
        ctx.strokeStyle = "hsl(45, 80%, 60%)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 120, 60);
        if (action.text) {
          ctx.font = "11px Inter, sans-serif";
          ctx.fillStyle = "hsl(215, 28%, 17%)";
          // Word wrap
          const words = action.text.split(" ");
          let line = "";
          let lineY = y + 16;
          words.forEach((word) => {
            const test = line + word + " ";
            if (ctx.measureText(test).width > 110 && line) {
              ctx.fillText(line, x + 6, lineY);
              line = word + " ";
              lineY += 14;
            } else {
              line = test;
            }
          });
          ctx.fillText(line, x + 6, lineY);
        }
      }
    });

    // Draw current stroke in progress
    if (isDrawing && activeTool === "draw" && currentPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "hsl(149, 100%, 33%)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    // Draw current rect in progress
    if (isDrawing && startPos && (activeTool === "highlight" || activeTool === "select") && currentPoints.length > 0) {
      const last = currentPoints[currentPoints.length - 1];
      const rx = Math.min(startPos.x, last.x);
      const ry = Math.min(startPos.y, last.y);
      const rw = Math.abs(last.x - startPos.x);
      const rh = Math.abs(last.y - startPos.y);
      if (activeTool === "highlight") {
        ctx.fillStyle = "hsla(149, 100%, 33%, 0.2)";
        ctx.fillRect(rx, ry, rw, rh);
      } else {
        ctx.strokeStyle = "hsl(149, 100%, 33%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);
      }
    }
  }, [pageActions, isDrawing, currentPoints, startPos, activeTool, width, height]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!activeTool) return;
      const pos = getPos(e);

      if (activeTool === "text") {
        setTextInput({ x: pos.x, y: pos.y, visible: true });
        setTextValue("");
        return;
      }

      if (activeTool === "note") {
        const noteText = prompt("Enter note:");
        if (noteText) {
          addAction({
            id: crypto.randomUUID(),
            tool: "note",
            page,
            textPos: pos,
            text: noteText,
          });
        }
        return;
      }

      if (activeTool === "eraser") {
        // Find and remove the last action near click point
        // Simple: remove the last action on this page
        const pageActs = actions.filter((a) => a.page === page);
        if (pageActs.length > 0) {
          // We can't truly remove from context easily, so we add an eraser action
          // Instead, let's just use undo behavior - inform user
        }
        return;
      }

      setIsDrawing(true);
      setCurrentPoints([pos]);
      setStartPos(pos);
    },
    [activeTool, page, addAction, actions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !activeTool) return;
      const pos = getPos(e);
      setCurrentPoints((prev) => [...prev, pos]);
    },
    [isDrawing, activeTool]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !activeTool || !startPos) {
      setIsDrawing(false);
      return;
    }

    if (activeTool === "draw" && currentPoints.length > 1) {
      addAction({
        id: crypto.randomUUID(),
        tool: "draw",
        page,
        points: currentPoints,
      });
    }

    if ((activeTool === "highlight" || activeTool === "select") && currentPoints.length > 0) {
      const last = currentPoints[currentPoints.length - 1];
      const rx = Math.min(startPos.x, last.x);
      const ry = Math.min(startPos.y, last.y);
      const rw = Math.abs(last.x - startPos.x);
      const rh = Math.abs(last.y - startPos.y);
      if (rw > 5 && rh > 5) {
        addAction({
          id: crypto.randomUUID(),
          tool: activeTool,
          page,
          rect: { x: rx, y: ry, w: rw, h: rh },
        });
      }
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setStartPos(null);
  }, [isDrawing, activeTool, currentPoints, startPos, page, addAction]);

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      addAction({
        id: crypto.randomUUID(),
        tool: "text",
        page,
        text: textValue,
        textPos: { x: textInput.x, y: textInput.y },
      });
    }
    setTextInput({ x: 0, y: 0, visible: false });
    setTextValue("");
  };

  const cursorStyle = activeTool === "draw"
    ? "crosshair"
    : activeTool === "highlight" || activeTool === "select"
    ? "crosshair"
    : activeTool === "text"
    ? "text"
    : activeTool === "eraser"
    ? "pointer"
    : activeTool === "note"
    ? "pointer"
    : "default";

  return (
    <div className="absolute inset-0" style={{ cursor: cursorStyle }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawing) handleMouseUp();
        }}
        className="absolute inset-0"
        style={{ width, height }}
      />
      {/* Inline text input */}
      {textInput.visible && (
        <input
          autoFocus
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTextSubmit();
            if (e.key === "Escape") setTextInput({ x: 0, y: 0, visible: false });
          }}
          onBlur={handleTextSubmit}
          className="absolute bg-card/90 border border-primary rounded px-2 py-1 text-sm text-foreground outline-none shadow-md"
          style={{ left: textInput.x, top: textInput.y - 10 }}
          placeholder="Type here..."
        />
      )}
    </div>
  );
};

export default CanvasOverlay;
