// main-panel.dialogs.tsx
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { DialogNodeComp } from "./dialog-node.dialogs";
import { PhylumNode } from "./phylum-node.dialog";
import { ChoiceNode } from "./choice-node.dialogs";
import { useRef, useImperativeHandle, forwardRef } from "react";
import { Pos } from "../../context/dialog.context";

const nodeTypes = {
  dialogNode: DialogNodeComp,
  phylumNode: PhylumNode,
  choiceNode: ChoiceNode,
};

export type DialogMainPanelHandle = {
  getCanvasCenter: () => Pos;
};

export const DialogMainPanel = forwardRef<DialogMainPanelHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  useImperativeHandle(ref, () => ({
    getCanvasCenter: () => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };

      const rect = container.getBoundingClientRect();
      return screenToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
  }));

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlow nodeTypes={nodeTypes}>
        <Background />
        <Controls
          style={{
            backgroundColor: '#191724',
            border: '2px solid #31748f',
            borderRadius: '0.375rem',
            overflow: 'hidden',
          }}
        />
      </ReactFlow>
    </div>
  );
});
