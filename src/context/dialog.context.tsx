import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { useSaveDialog } from "../hooks/queries/dialogs";
import { NodeType } from "../pages/dialog-page";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, Node, NodeChange, type Edge } from "@xyflow/react";
import { DialogNode } from "../bindings/DialogNode";
import { Choices } from "../bindings/Choices";
import { Phylum } from "../bindings/Phylum";
import { useGlobalState } from "./global-state.context";
import { buildBackDialogFromNodesAndEdges, getLongestPathFromRoot, getOptimalHandles, traverseDialogAndGetNodesAndEdges } from "./helpers/dialog.helpers";

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
  updateNodeData: (nodeId: string, data: Partial<DialogNodeData> | Partial<ChoicesNodeData> | Partial<PhylumNodeData>) => void

  dialogFeed: AppNode[],
  nodes: AppNode[],
  edges: Edge[],
  rootNodeId: string | null
  dialog:Dialog | undefined,
  setRootNode: (nodeId: string) => void

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
  const isInitialLoadRef = useRef(true);
  const saveDialogMutation = useSaveDialog();
  const [rootNodeId, setRootNodeId] = useState<string | null>(null);

  const loadDialog = useCallback((dialog: Dialog) => {
    isInitialLoadRef.current = true;
    dialogRef.current = dialog;

    //TODO: smells like shit, should have thought this through
    setRootNodeId(dialog.root_node);
    rootNodeRef.current = dialog.root_node;

    const res = traverseDialogAndGetNodesAndEdges(dialogRef.current);
    setNodes(res.nodes);
    setEdges(res.edges);
  }, []);

  const setRootNode = useCallback((nodeId: string) => {
    rootNodeRef.current = nodeId;
    setRootNodeId(nodeId);
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

  const { forwardMap, reverseMap } = useMemo(() => {
    const fwd = new Map<string, string[]>();
    const rev = new Map<string, string[]>();

    for (const edge of edges) {
      fwd.set(edge.source, [...(fwd.get(edge.source) ?? []), edge.target]);
      rev.set(edge.target, [...(rev.get(edge.target) ?? []), edge.source]);
    }

    return { forwardMap: fwd, reverseMap: rev };
  }, [edges]);

  const nodeMap = useMemo(() => {
    const res = new Map<string, AppNode>();
    for (const node of nodes) {
      res.set(node.id, node);
    }
    return res
  }, [nodes])

  const dialogFeed = useMemo(() => {
    if (dialogRef.current?.root_node) {

      const path = getLongestPathFromRoot(dialogRef.current.root_node, forwardMap);
      return path.map((p) => nodeMap.get(p)!);
    }
    return []
  }, [forwardMap, nodeMap]);


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
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    saveDialog().then(() => {
    }).catch((e) => console.error(e))
  }, [nodes, edges])


  const createDialogNode = useCallback((pos: Pos) => {
    const isRootNode = nodesRef.current.length === 0;
    const id = crypto.randomUUID();

    if (isRootNode) {
      rootNodeRef.current = id;
      setRootNode(id);
    }

    const previousNode = lastNodeRef.current;

    const newNode: DialogFlowNode = {
      id,
      type: 'dialogNode',
      position: { x: pos.x, y: pos.y },
      data: {
        next_node: null,
        content: '',
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

  const updateNodeData = useCallback((
    nodeId: string,
    newData: Partial<DialogNodeData> | Partial<ChoicesNodeData> | Partial<PhylumNodeData>
  ) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } } as AppNode
          : node
      )
    );
  }, []);

  return (
    <DialogContext.Provider value={{
      updateNodeData,
      createDialogNode,
      loadDialog,
      nodes,
      edges,
      saveDialog,
      onNodesChange,
      onConnect,
      onEdgesChange,
      dialogFeed,
      rootNodeId,
      setRootNode,
      dialog:dialogRef.current,
    }}>
      {children}
    </DialogContext.Provider>
  )
}


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
