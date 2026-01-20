import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { useSaveDialog } from "../hooks/queries/dialogs";
import { NodeType } from "../pages/dialog-page";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, Node, NodeChange, type Edge } from "@xyflow/react";
import { DialogNode } from "../bindings/DialogNode";
import { Choices } from "../bindings/Choices";
import { Phylum } from "../bindings/Phylum";
import { useGlobalState } from "./global-state.context";
import { buildBackDialogFromNodesAndEdges, traverseDialogAndGetNodesAndEdges } from "./helpers/dialog.helpers";

// Node data types matching your Rust NodeData enum
type DialogNodeData = DialogNode & { isRootNode?: boolean };
type ChoicesNodeData = Choices & { isRootNode?: boolean };
type PhylumNodeData = Phylum & { isRootNode?: boolean };

// Typed React Flow nodes
export type DialogFlowNode = Node<DialogNodeData, 'dialogNode'>;
export type ChoicesFlowNode = Node<ChoicesNodeData, 'choiceNode'>;
export type PhylumFlowNode = Node<PhylumNodeData, 'phylumNode'>;

export type AppNode = DialogFlowNode | ChoicesFlowNode | PhylumFlowNode;

export type Pos = { x: number, y: number };

export type DisplayedNode = Node & {
  isRootNode: boolean,
  visited: boolean
}


type DialogContextType = {
  createDialogNode: (pos: Pos) => void
  loadDialog: (dialog: Dialog) => void
  saveDialog: () => Promise<void>
  onNodesChange: (changes: NodeChange<AppNode>[]) => void
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void
  onConnect: (connection: Connection) => void
  nodes: AppNode[],
  edges: Edge[],
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const { project } = useGlobalState();
  const dialogRef = useRef<Dialog | undefined>(undefined);
  const [nodes, setNodes] = useState<AppNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Pour créer automatiquement un edge avec l'ancien node
  const lastNodeRef = useRef<Node | undefined>(undefined);
  const rootNodeRef = useRef<string | null>(null);
  const saveDialogMutation = useSaveDialog();

  const loadDialog = useCallback((dialog: Dialog) => {
    dialogRef.current = dialog;
    rootNodeRef.current = dialogRef.current.root_node
    const res = traverseDialogAndGetNodesAndEdges(dialogRef.current);
    setNodes(res.nodes);
    setEdges(res.edges);
  }, [dialogRef.current, rootNodeRef.current]);

  const onNodesChange = useCallback((changes: NodeChange<AppNode>[]) => {
    console.log("---------Nodes-----------")
    console.log(changes)
    console.log("-------------------------")
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    console.log("---------Edges-----------")
    console.log(changes)
    console.log("-------------------------")
    setEdges((prev) => applyEdgeChanges(changes, prev));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    console.log("---------Conn------------")
    console.log(connection);
    console.log("-------------------------")
    setEdges((prev) => addEdge(connection, prev));

  }, []);


  const saveDialog = useCallback(async () => {
    if (!project || !dialogRef.current) {
      throw new Error("saving dialog outside of coherent scope");
    };
    const res = buildBackDialogFromNodesAndEdges(nodes, edges);
    const dialog = dialogRef.current
    dialog.root_node = rootNodeRef.current;
    dialog.nodes = res;
    await saveDialogMutation.mutateAsync({
      projectId: project.id,
      dialog: dialog
    })
  }, [dialogRef.current, rootNodeRef.current])


  const createDialogNode = (pos: Pos) => {
    const isRootNode = nodes.length === 0;
    const id = crypto.randomUUID();
    const previousNode = lastNodeRef.current; // capture before updating

    const newNode: DialogFlowNode = {
      id,
      type: 'dialogNode',
      position: { x: pos.x, y: pos.y },
      data: {
        next_node: null,
        character_id: null,
        content_link: null,
        isRootNode,
      },
    };

    setNodes((prev) => [...prev, newNode]);
    lastNodeRef.current = newNode;

    if (previousNode) {
      setEdges((prev) => [
        ...prev,
        { id: `${previousNode.id}-${id}`, source: previousNode.id, target: id },
      ]);
    }
  };

  return (
    <DialogContext.Provider value={{
      createDialogNode,
      loadDialog,
      nodes,
      edges,
      saveDialog,
      onNodesChange,
      onConnect,
      onEdgesChange,
    }}>
      {children}
    </DialogContext.Provider>
  )
}


export const useDialog = (dialog: Dialog) => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("Cannot use dialog context outside of dialog provider")
  }

  useEffect(() => {
    ctx.loadDialog(dialog);
  }, [dialog.id]);


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
