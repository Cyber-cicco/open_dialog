// dialog.helpers.ts
import { Edge } from "@xyflow/react";
import { AppNode } from "../dialog.context";
import { Node as RustNode } from '../../bindings/Node';
import { Dialog } from "../../bindings/Dialog";

export function buildBackDialogFromNodesAndEdges(
    nodes: AppNode[],
    edges: Edge[]
): Record<string, RustNode> {
    const result: Record<string, RustNode> = {};

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
                id: node.id,
                pos_x,
                pos_y,
                data: {
                    Dialog: {
                        content: node.data.content,
                        next_node: edge?.target ?? null,
                        character_id: node.data.character_id,
                        content_link: node.data.content_link,
                    }
                }
            };
        }
        else if (node.type === 'choiceNode') {
            const choices = node.data.choices.map((choice) => {
                const edge = nodeEdges.find(e => e.sourceHandle === `choice-${choice.id}`);
                return { ...choice, next_node: edge?.target ?? null };
            });
            result[node.id] = {
                id: node.id,
                pos_x,
                pos_y,
                data: { Choices: { choices } }
            };
        }
        else if (node.type === 'phylumNode') {
            const branches = node.data.branches.map((branch) => {
                const edge = nodeEdges.find(e => e.sourceHandle === `branch-${branch.id}`);
                return { ...branch, next_node: edge?.target ?? null };
            });
            result[node.id] = {
                id: node.id,
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

export function getOptimalHandles(
    sourcePos: { x: number; y: number },
    targetPos: { x: number; y: number },
    sourceWidth = 360,
    sourceHeight = 272,
    targetWidth = 360,
    targetHeight = 272
): { sourceHandle: string; targetHandle: string } {
    const sourceCenterX = sourcePos.x + sourceWidth / 2;
    const sourceCenterY = sourcePos.y + sourceHeight / 2;
    const targetCenterX = targetPos.x + targetWidth / 2;
    const targetCenterY = targetPos.y + targetHeight / 2;

    const dx = targetCenterX - sourceCenterX;
    const dy = targetCenterY - sourceCenterY;

    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0
            ? { sourceHandle: 'right-source', targetHandle: 'left-target' }
            : { sourceHandle: 'left-source', targetHandle: 'right-target' };
    } else {
        return dy >= 0
            ? { sourceHandle: 'bottom-source', targetHandle: 'top-target' }
            : { sourceHandle: 'top-source', targetHandle: 'bottom-target' };
    }
}

export function traverseDialogAndGetNodesAndEdges(dialog: Dialog): { nodes: AppNode[], edges: Edge[] } {
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];

    // First pass: create all nodes
    for (const [id, node] of Object.entries(dialog.nodes)) {
        if (!node) continue;
        const isRootNode = dialog.root_node === id;
        const position = { x: node.pos_x, y: node.pos_y };

        if ('Dialog' in node.data) {
            const data = node.data.Dialog;
            nodes.push({ id, type: 'dialogNode', position, data: { ...data, isRootNode } });
        }
        else if ('Choices' in node.data) {
            const data = node.data.Choices;
            nodes.push({ id, type: 'choiceNode', position, data: { ...data, isRootNode } });
        }
        else if ('Phylum' in node.data) {
            const data = node.data.Phylum;
            nodes.push({ id, type: 'phylumNode', position, data: { ...data, isRootNode } });
        }
    }

    // Second pass: create edges with optimal handles
    for (const [id, node] of Object.entries(dialog.nodes)) {
        if (!node) continue;
        const sourcePos = { x: node.pos_x, y: node.pos_y };

        if ('Dialog' in node.data) {
            const data = node.data.Dialog;
            if (data.next_node) {
                const targetNode = dialog.nodes[data.next_node];
                if (targetNode) {
                    const targetPos = { x: targetNode.pos_x, y: targetNode.pos_y };
                    const handles = getOptimalHandles(sourcePos, targetPos);
                    edges.push({
                        id: `${id}-${data.next_node}`,
                        source: id,
                        target: data.next_node,
                        ...handles
                    });
                }
            }
        }
        else if ('Choices' in node.data) {
            const data = node.data.Choices;
            data.choices.forEach((choice) => {
                if (choice.next_node) {
                    const targetNode = dialog.nodes[choice.next_node];
                    if (targetNode) {
                        const targetPos = { x: targetNode.pos_x, y: targetNode.pos_y };
                        const handles = getOptimalHandles(sourcePos, targetPos);
                        edges.push({
                            id: `${id}-choice-${choice.id}-${choice.next_node}`,
                            source: id,
                            target: choice.next_node,
                            sourceHandle: `choice-${choice.id}`,
                            targetHandle: handles.targetHandle,
                        });
                    }
                }
            });
        }
        else if ('Phylum' in node.data) {
            const data = node.data.Phylum;
            data.branches.forEach((branch) => {
                if (branch.next_node) {
                    const targetNode = dialog.nodes[branch.next_node];
                    if (targetNode) {
                        const targetPos = { x: targetNode.pos_x, y: targetNode.pos_y };
                        const handles = getOptimalHandles(sourcePos, targetPos);
                        edges.push({
                            id: `${id}-branch-${branch.id}-${branch.next_node}`,
                            source: id,
                            target: branch.next_node,
                            sourceHandle: `branch-${branch.id}`,
                            targetHandle: handles.targetHandle,
                        });
                    }
                }
            });
        }
    }

    return { nodes, edges };
}

export function findFirstTerminatingPath(visited: Set<string>, fwm: Map<string, string[]>, curr: string, res: string[]): string[] {
    if (visited.has(curr)) {
        return res;
    }

    res.push(curr);
    visited.add(curr);
    if (!fwm.has(curr)) {
        return res;
    }

    for (let fwn of fwm.get(curr)!) {
        return findFirstTerminatingPath(visited, fwm, fwn, res);
    }
    return res;
}

export function getLongestPathFromRoot(rootNode: string, fwm: Map<string, string[]>): string[] {
    return findLongestNonRedondantPath(new Set(), [], fwm, rootNode);
}

function findLongestNonRedondantPath(visited: Set<string>, res: string[], fwm: Map<string, string[]>, curr: string) {
    if (visited.has(curr)) {
        return res;
    }

    res.push(curr);
    visited.add(curr);
    if (!fwm.has(curr)) {
        return res;
    }

    let paths: string[][] = []
    for (let fwn of fwm.get(curr)!) {
        let curr_visited = new Set(visited);
        paths.push(findLongestNonRedondantPath(curr_visited, [], fwm, fwn))
    }
    if (paths.length === 1) {
        return [...res, ...paths[0]]
    }
    let longestArrayid = 0;
    for (let i = 0; i < paths.length; i++) {
        if (paths[i].length > paths[longestArrayid].length) {
            longestArrayid = i;
        }
    }
    if (paths.length === 0) {
        return [];
    }

    return [...res, ...paths[longestArrayid]]
}


function findPathContainingNode(curr: string, visited: Set<string>, res: string[], haystack: Map<string, string[]>, needle: string): string[] {
    if (needle === curr) {
        return res
    }
    res.push(curr);
    if (visited.has(curr)) {
        return [];
    }

    if (!haystack.has(curr)) {
        return [];
    }
    visited.add(curr);

    let paths: string[][] = []
    for (let node of haystack.get(curr)!) {
        let curr_visited = new Set(visited);
        paths.push(findPathContainingNode(node, curr_visited, [], haystack, needle))
    }
    if (paths.length === 1) {
        return [...res, ...paths[0]]
    }

    for (let path of paths) {
        if (path.length > 0) {
            return [...res, ...path]
        }
    }
    return []
}

