import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Tool = "highlight" | "note" | "select" | "text" | "draw" | "eraser" | null;

export interface DrawAction {
  id: string;
  tool: Tool;
  page: number;
  points?: { x: number; y: number }[];
  rect?: { x: number; y: number; w: number; h: number };
  text?: string;
  textPos?: { x: number; y: number };
  color?: string;
}

interface EditorContextType {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  actions: DrawAction[];
  addAction: (action: DrawAction) => void;
  removeAction: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearPage: (page: number) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

const defaultContext: EditorContextType = {
  activeTool: null,
  setActiveTool: () => {},
  activeColor: "hsl(215, 28%, 17%)",
  setActiveColor: () => {},
  actions: [],
  addAction: () => {},
  removeAction: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  clearPage: () => {},
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  return ctx ?? defaultContext;
};

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [activeColor, setActiveColor] = useState("hsl(215, 28%, 17%)");
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [undoneActions, setUndoneActions] = useState<DrawAction[]>([]);

  const addAction = useCallback((action: DrawAction) => {
    setActions((prev) => [...prev, action]);
    setUndoneActions([]);
  }, []);

  const removeAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const undo = useCallback(() => {
    setActions((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setUndoneActions((u) => [...u, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setUndoneActions((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setActions((a) => [...a, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const clearPage = useCallback((page: number) => {
    setActions((prev) => prev.filter((a) => a.page !== page));
    setUndoneActions([]);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        activeTool,
        setActiveTool,
        activeColor,
        setActiveColor,
        actions,
        addAction,
        removeAction,
        undo,
        redo,
        canUndo: actions.length > 0,
        canRedo: undoneActions.length > 0,
        clearPage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
