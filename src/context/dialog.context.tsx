import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { useSaveDialog } from "../hooks/queries/dialogs";
import { NodeType } from "../pages/dialog-page";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, Node, NodeChange, type Edge } from "@xyflow/react";
import { DialogNode } from "../bindings/DialogNode";
import { Choices } from "../bindings/Choices";
import { Phylum } from "../bindings/Phylum";
import { useGlobalState } from "./global-state.context";
import { buildBackDialogFromNodesAndEdges, getOptimalHandles, traverseDialogAndGetNodesAndEdges } from "./helpers/dialog.helpers";

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

  // Ref to avoid stale closure in onConnect
  const nodesRef = useRef<AppNode[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

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
  }, []);

  const onNodesChange = useCallback((changes: NodeChange<AppNode>[]) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges((prev) => applyEdgeChanges(changes, prev));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((prev) => {
      const sourceNode = nodesRef.current.find(n => n.id === connection.source);

      // DialogNodes can only have one outgoing edge - replace existing if present
      if (sourceNode?.type === 'dialogNode') {
        const filtered = prev.filter(e => e.source !== connection.source);
        return addEdge(connection, filtered);
      }

      // For ChoiceNode/PhylumNode, edges are tied to specific handles
      // Replace only if same sourceHandle
      if (sourceNode?.type === 'choiceNode' || sourceNode?.type === 'phylumNode') {
        if (connection.sourceHandle) {
          const filtered = prev.filter(
            e => !(e.source === connection.source && e.sourceHandle === connection.sourceHandle)
          );
          return addEdge(connection, filtered);
        }
      }

      return addEdge(connection, prev);
    });
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
  }, [project, nodes, edges, saveDialogMutation])

  useEffect(() => {
    saveDialog().then(() => console.log("dialog saved"))
  }, [nodes, edges])


  const createDialogNode = useCallback((pos: Pos) => {
    const isRootNode = nodesRef.current.length === 0;
    const id = crypto.randomUUID();
    const previousNode = lastNodeRef.current;

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
      const handles = getOptimalHandles(previousNode.position, pos);
      setEdges((prev) => {
        const filtered = prev.filter(e => e.source !== previousNode.id);
        return [...filtered, {
          id: `${previousNode.id}-${id}`,
          source: previousNode.id,
          target: id,
          ...handles
        }];
      });
    }
  }, []);

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
