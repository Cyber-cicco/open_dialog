import { useMemo } from "react";
import { Edge } from "@xyflow/react";

export const useGraphMaps = (edges: Edge[]) => {
  return useMemo(() => {
    const forwardMap = new Map<string, string[]>();
    const reverseMap = new Map<string, string[]>();

    for (const edge of edges) {
      forwardMap.set(edge.source, [...(forwardMap.get(edge.source) ?? []), edge.target]);
      reverseMap.set(edge.target, [...(reverseMap.get(edge.target) ?? []), edge.source]);
    }

    return { forwardMap, reverseMap };
  }, [edges]);
};
