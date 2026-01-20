import { useParams } from "react-router-dom"
import { NodeToolbar } from "../components/dialogs/toolbar.dialogs"
import { useGetDialogById } from "../hooks/queries/dialogs"
import { useGlobalState } from "../context/global-state.context"
import { Project } from "../bindings/Project"
import { useDialog } from "../context/dialog.context"
import { Dialog } from "../bindings/Dialog"
import { Background, Controls, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react"
import { useRef } from "react"
import { DialogNodeComp } from "../components/dialogs/dialog-node.dialogs"
import { PhylumNode } from "../components/dialogs/phylum-node.dialog"
import { ChoiceNode } from "../components/dialogs/choice-node.dialogs"
import '@xyflow/react/dist/style.css'

export enum NodeType {
  DIALOG = 1,
  CHOICE = 2,
  PHYLUM = 3,
}

const nodeTypes = {
  dialogNode: DialogNodeComp,
  phylumNode: PhylumNode,
  choiceNode: ChoiceNode,
};

export const OuterDialogPage: React.FC = () => {
  const { project } = useGlobalState();
  const { id } = useParams();
  const { data: dialog, isPending, error } = useGetDialogById(project?.id || '', id || '')

  if (!id) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-muted">
        No dialog ID provided
      </div>
    )
  }

  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-muted">
        No project selected
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-muted">
        Loading dialog...
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400">
        Failed to load dialog: {error.message}
      </div>
    )
  }

  if (!dialog) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-muted">
        Dialog not found
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <InnerDialogPage project={project} dialog={dialog} />
    </ReactFlowProvider>
  )
}

const InnerDialogPage: React.FC<{ project: Project; dialog: Dialog }> = ({ dialog }) => {
  const { createNode, nodes, edges } = useDialog(dialog);
  const panelRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const getCanvasCenter = () => {
    const container = panelRef.current;
    if (!container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    return screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  const handleNodeCreate = (nodeType: NodeType) => {
    const pos = getCanvasCenter()
    createNode(nodeType, pos);
  };

  return (
    <div className="w-full h-full relative">
      <NodeToolbar onNodeCreate={handleNodeCreate} />
      <div ref={panelRef} style={{ width: "100%", height: "100%" }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
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
    </div>
  )
}
