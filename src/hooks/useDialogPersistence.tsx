import { useRef, useCallback } from "react";
import { useSaveDialog } from "./queries/dialogs";
import { Dialog } from "../bindings/Dialog";
import { AppNode } from "../context/dialog.context";
import { Edge } from "@xyflow/react";
import { buildBackDialogFromNodesAndEdges } from "../context/helpers/dialog.helpers";

type SaveConfig = {
  /** Save when nodes/edges are added or removed */
  onStructuralChange?: boolean;
  /** Save when node content changes */
  onContentChange?: boolean;
  /** Save when nodes are repositioned */
  onPositionChange?: boolean;
  /** Debounce delay in ms (0 = immediate) */
  debounceMs?: number;
};

const DEFAULT_CONFIG: SaveConfig = {
  onStructuralChange: true,
  onContentChange: true,
  onPositionChange: false,
  debounceMs: 1000,
};

export const useDialogPersistence = (
  projectId: string | undefined,
  config: SaveConfig = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const saveDialogMutation = useSaveDialog();
  const debounceRef = useRef<number | null>(null);
  const dialogRef = useRef<Dialog | null>(null);
  const rootNodeRef = useRef<string | null>(null);

  const setDialog = useCallback((dialog: Dialog) => {
    dialogRef.current = dialog;
    rootNodeRef.current = dialog.root_node;
  }, []);

  const setRootNode = useCallback((nodeId: string) => {
    rootNodeRef.current = nodeId;
  }, []);

  const save = useCallback(async (nodes: AppNode[], edges: Edge[]) => {
    if (!projectId || !dialogRef.current) return;

    const res = buildBackDialogFromNodesAndEdges(nodes, edges);
    const dialog = dialogRef.current;
    dialog.root_node = rootNodeRef.current;
    dialog.nodes = res;

    await saveDialogMutation.mutateAsync({ projectId, dialog });
  }, [projectId, saveDialogMutation]);

  const scheduleSave = useCallback((nodes: AppNode[], edges: Edge[]) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (mergedConfig.debounceMs === 0) {
      save(nodes, edges);
    } else {
      debounceRef.current = setTimeout(() => {
        save(nodes, edges);
      }, mergedConfig.debounceMs);
    }
  }, [save, mergedConfig.debounceMs]);

  // Call these from your handlers based on what changed
  const onStructuralChange = useCallback((nodes: AppNode[], edges: Edge[]) => {
    if (mergedConfig.onStructuralChange) scheduleSave(nodes, edges);
  }, [mergedConfig.onStructuralChange, scheduleSave]);

  const onContentChange = useCallback((nodes: AppNode[], edges: Edge[]) => {
    if (mergedConfig.onContentChange) scheduleSave(nodes, edges);
  }, [mergedConfig.onContentChange, scheduleSave]);

  const onPositionChange = useCallback((nodes: AppNode[], edges: Edge[]) => {
    if (mergedConfig.onPositionChange) scheduleSave(nodes, edges);
  }, [mergedConfig.onPositionChange, scheduleSave]);

  return {
    setDialog,
    setRootNode,
    save,
    onStructuralChange,
    onContentChange,
    onPositionChange,
  };
};
