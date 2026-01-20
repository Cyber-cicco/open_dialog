import { Edge, EdgeChange, NodeChange } from "@xyflow/react";
import { AppNode } from "../dialog.context";
import { Node as RustNode } from '../../bindings/Node';
import { Dialog } from "../../bindings/Dialog";

export function buildBackDialogFromNodesAndEdges(
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

export function traverseDialogAndGetNodesAndEdges(dialog: Dialog): { nodes: AppNode[], edges: Edge[] } {
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

export function getOptimalHandles(
  sourcePos: { x: number },
  targetPos: { x: number },
  sourceWidth = 360,
  targetWidth = 360
): { sourceHandle: string; targetHandle: string } {
  const sourceCenterX = sourcePos.x + sourceWidth / 2;
  const targetCenterX = targetPos.x + targetWidth / 2;

  if (targetCenterX >= sourceCenterX) {
    return { sourceHandle: 'right-source', targetHandle: 'left-target' };
  } else {
    return { sourceHandle: 'left-source', targetHandle: 'right-target' };
  }
}
