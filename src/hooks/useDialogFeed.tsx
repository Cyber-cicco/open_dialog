import { useMemo } from "react";
import { AppNode } from "../context/dialog.context";
import { getLongestPathFromRoot } from "../context/helpers/dialog.helpers";

export const useDialogFeed = (
  rootNodeId: string | null,
  nodes: AppNode[],
  forwardMap: Map<string, string[]>
) => {
  const nodeMap = useMemo(() => {
    return new Map(nodes.map(node => [node.id, node]));
  }, [nodes]);

  return useMemo(() => {
    if (!rootNodeId) return [];
    const path = getLongestPathFromRoot(rootNodeId, forwardMap);
    return path.map(id => nodeMap.get(id)).filter(Boolean) as AppNode[];
  }, [rootNodeId, forwardMap, nodeMap]);
};
