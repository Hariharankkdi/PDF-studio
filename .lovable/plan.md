

## Fix: PDF Editing Tools Not Responding to Mouse Events

### Problem
The editing canvas overlay is positioned correctly over the PDF, and the tool selection works (confirmed by console logs showing `activeTool` changing). However, the react-pdf `TextLayer` and `AnnotationLayer` sit on top of the canvas and intercept all mouse/click events, so drawing, highlighting, and text placement never trigger.

### Solution

**1. Make the CanvasOverlay capture events when a tool is active**
- In `CanvasOverlay.tsx`, add a `z-index` of 10 and `pointer-events: auto` to the overlay wrapper when `activeTool` is not null
- When no tool is selected, set `pointer-events: none` so normal PDF text selection works

**2. Suppress react-pdf text/annotation layer pointer events during editing**
- In `PDFViewer.tsx` (or via CSS), add styles to disable `pointer-events` on `.react-pdf__Page__textContent` and `.react-pdf__Page__annotations` when an editing tool is active
- This ensures the canvas receives all mouse events during editing

### Technical Details

**File: `src/components/CanvasOverlay.tsx`**
- Add `style` with `zIndex: 10` and `pointerEvents: activeTool ? 'auto' : 'none'` to the wrapping `<div>`

**File: `src/index.css` (or scoped styles)**
- Add CSS rule: when canvas overlay is active, set `.react-pdf__Page__textContent` and `.react-pdf__Page__annotations` to `pointer-events: none`

This is a minimal, targeted fix -- two small changes that unblock all editing tools without affecting PDF viewing when no tool is selected.

