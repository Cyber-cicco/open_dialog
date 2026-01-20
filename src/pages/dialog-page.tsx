// dialog-page.tsx
import { useParams } from "react-router-dom"
import { DialogMainPanel, DialogMainPanelHandle } from "../components/dialogs/main-panel.dialogs"
import { NodeToolbar } from "../components/dialogs/toolbar.dialogs"
import { useGetDialogById } from "../hooks/queries/dialogs"
import { useGlobalState } from "../context/global-state.context"
import { Project } from "../bindings/Project"
import { useDialog } from "../context/dialog.context"
import { Dialog } from "../bindings/Dialog"
import { ReactFlowProvider } from "@xyflow/react"
import { useRef } from "react"

export enum NodeType {
  DIALOG = 1,
  CHOICE = 2,
  PHYLUM = 3,
}

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
  const { createNode } = useDialog(dialog);
  const panelRef = useRef<DialogMainPanelHandle>(null);

  const handleNodeCreate = (nodeType: NodeType) => {
    const pos = panelRef.current?.getCanvasCenter() ?? { x: 0, y: 0 };
    createNode(nodeType, pos);
  };

  return (
    <div className="w-full h-full relative">
      <NodeToolbar onNodeCreate={handleNodeCreate} />
      <DialogMainPanel ref={panelRef} />
    </div>
  )
}
