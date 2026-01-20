import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { useSaveDialog } from "../hooks/queries/dialogs";
import { NodeType } from "../pages/dialog-page";
import { Node, type Edge } from "@xyflow/react";
import { Node as RustNode } from '../bindings/Node';
import { DialogNode } from "../bindings/DialogNode";
import { Choices } from "../bindings/Choices";
import { Phylum } from "../bindings/Phylum";
import { useGlobalState } from "./global-state.context";

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


function buildBackDialogFromNodesAndEdges(
  nodes: AppNode[],
  edges: Edge[]
): Record<string, RustNode> {
  const result: Record<string, RustNode> = {};

  // Index edges by source node
  const edgesBySource = new Map<string, Edge[]>();
  for (const edge of edges) {
    const arr = edgesBySource.get(edge.source) ?? [];
    arr.push(edge);
    edgesBySource.set(edge.source, arr);
  }

  for (const node of nodes) {
    const nodeEdges = edgesBySource.get(node.id) ?? [];
    const pos_x = Math.round(node.position.x);
    const pos_y = Math.round(node.position.y);

    if (node.type === 'dialogNode') {
      const edge = nodeEdges[0];
      result[node.id] = {
        pos_x,
        pos_y,
        data: {
          Dialog: {
            next_node: edge?.target ?? null,
            character_id: node.data.character_id,
            content_link: node.data.content_link,
          }
        }
      };
    }
    else if (node.type === 'choiceNode') {
      const choices = node.data.choices.map((choice, idx) => {
        const edge = nodeEdges.find(e => e.sourceHandle === `choice-${idx}`);
        return { ...choice, next_node: edge?.target ?? null };
      });
      result[node.id] = {
        pos_x,
        pos_y,
        data: { Choices: { choices } }
      };
    }
    else if (node.type === 'phylumNode') {
      const branches = node.data.branches.map((branch, idx) => {
        const edge = nodeEdges.find(e => e.sourceHandle === `branch-${idx}`);
        return { ...branch, next_node: edge?.target ?? null };
      });
      result[node.id] = {
        pos_x,
        pos_y,
        data: {
          Phylum: {
            id: node.data.id,
            name: node.data.name,
            branches,
          }
        }
      };
    }
  }

  return result;
}

function traverseDialogAndGetNodesAndEdges(dialog: Dialog): { nodes: AppNode[], edges: Edge[] } {
  const nodes: AppNode[] = [];
  const edges: Edge[] = [];

  for (const [id, node] of Object.entries(dialog.nodes)) {
    if (!node) continue;
    const isRootNode = dialog.root_node === id;
    const position = { x: node.pos_x, y: node.pos_y };

    if ('Dialog' in node.data) {
      const data = node.data.Dialog;
      nodes.push({ id, type: 'dialogNode', position, data: { ...data, isRootNode } });

      if (data.next_node) {
        edges.push({ id: `${id}-${data.next_node}`, source: id, target: data.next_node });
      }
    }
    else if ('Choices' in node.data) {
      const data = node.data.Choices;
      nodes.push({ id, type: 'choiceNode', position, data: { ...data, isRootNode } });

      data.choices.forEach((choice, idx) => {
        if (choice.next_node) {
          edges.push({
            id: `${id}-choice-${idx}-${choice.next_node}`,
            source: id,
            target: choice.next_node,
            sourceHandle: `choice-${idx}`,
          });
        }
      });
    }
    else if ('Phylum' in node.data) {
      const data = node.data.Phylum;
      nodes.push({ id, type: 'phylumNode', position, data: { ...data, isRootNode } });

      data.branches.forEach((branch, idx) => {
        if (branch.next_node) {
          edges.push({
            id: `${id}-branch-${idx}-${branch.next_node}`,
            source: id,
            target: branch.next_node,
            sourceHandle: `branch-${idx}`,
          });
        }
      });
    }
  }

  return { nodes, edges };
}

type DialogContextType = {
  createDialogNode: (pos: Pos) => void
  loadDialog: (dialog: Dialog) => void
  saveDialog: () => Promise<void>
  nodes: Node[],
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
  }
}
