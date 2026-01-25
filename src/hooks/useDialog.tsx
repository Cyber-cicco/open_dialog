import { useContext, useEffect } from "react";
import { DialogContext, Pos } from "../context/dialog.context";
import { Dialog } from "../bindings/Dialog";
import { NodeType } from "../pages/dialog-page";

export const useDialog = (dialog: Dialog | undefined) => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("Cannot use dialog context outside of dialog provider")
  }

  useEffect(() => {
    if (dialog) {
      ctx.loadDialog(dialog);
    }
  }, [dialog?.id]);


  function createNode(nodeType: NodeType, middlePos: Pos) {
    switch (nodeType) {
      case NodeType.DIALOG: ctx?.createDialogNode(middlePos)
        break;
      case NodeType.CHOICE:
      case NodeType.PHYLUM:
    }
  }

  return {
    createNode,
    nodes: ctx.nodes,
    edges: ctx.edges,
    onNodesChange: ctx.onNodesChange,
    onConnect: ctx.onConnect,
    onEdgesChange: ctx.onEdgesChange,
  }
}

export const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("Cannot use dialog context outside of dialog provider")
  }
  return ctx
}
