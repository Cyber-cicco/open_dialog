import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../../context/global-state.context";
import { useRightPanel } from "../../../context/right-panel.context";
import { useDialogContext } from "../../../hooks/useDialog";
import { AppNode, ChoicesFlowNode, DialogFlowNode, PhylumFlowNode } from "../../../context/dialog.context";
import { evaluateNecessity } from "./helpers";
import { KEYMAP_PRIO, useKeyBinding } from "../../../context/keymap.context";
import { PlayDialogNode } from "./play-node";
import { PlayChoiceNode } from "./choice-node";
import { EndMessage } from "./end-message";

export type PlayState = {
  currentNodeId: string | null;
  history: string[];
  choicesMade: Record<number, string>;
};

export const PlayMode = () => {
  const { nodes, edges, rootNodeId, dialog, saveDialog } = useDialogContext();
  const { setCurrentSpeaker } = useRightPanel();
  const { project, variables, isPending: variablesLoading } = useGlobalState();

  const [playState, setPlayState] = useState<PlayState>({
    currentNodeId: null,
    history: [],
    choicesMade: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [focusedChoiceIndex, setFocusedChoiceIndex] = useState(0);

  const feedRef = useRef<HTMLDivElement>(null);

  // Derive current node state for keybindings
  const currentNode = nodes.find((n) => n.id === playState.currentNodeId);
  const currentHistoryIndex = playState.history.length - 1;
  const isOnActiveChoiceNode = currentNode?.type === "choiceNode" && !playState.choicesMade[currentHistoryIndex];
  const choicesCount = isOnActiveChoiceNode ? (currentNode as ChoicesFlowNode).data.choices.length : 0;

  // Reset focus when node changes
  useEffect(() => {
    setFocusedChoiceIndex(0);
  }, [playState.currentNodeId]);

  const init = async () => {
    setIsLoading(true);
    await saveDialog();
    setPlayState({ currentNodeId: rootNodeId, history: rootNodeId ? [rootNodeId] : [], choicesMade: {} });
    setIsLoading(false);
  };

  const getLastSpeaker = (): string | null => {
    for (let i = playState.history.length - 1; i >= 0; i--) {
      const node = nodes.find((n) => n.id === playState.history[i]);
      if (node?.type === "dialogNode") {
        const charId = (node as DialogFlowNode).data.character_id;
        if (charId) return charId;
      }
    }
    return dialog?.main_character ?? null;
  };

  const getNextNodeId = useCallback(
    (fromNodeId: string, sourceHandle?: string): string | null => {
      const edge = edges.find((e) => e.source === fromNodeId && (!sourceHandle || e.sourceHandle === sourceHandle));
      return edge?.target ?? null;
    },
    [edges]
  );

  const getCharacterIdForNode = (node: DialogFlowNode, historyIndex: number): string => {
    if (node.data.character_id) return node.data.character_id;
    for (let i = historyIndex - 1; i >= 0; i--) {
      const prevNode = nodes.find((n) => n.id === playState.history[i]);
      if (prevNode?.type === "dialogNode") {
        const charId = (prevNode as DialogFlowNode).data.character_id;
        if (charId) return charId;
      }
    }
    return dialog?.main_character ?? "";
  };

  const handleChoiceSelect = useCallback((nextNodeId: string | null, choiceId: string) => {
    setPlayState((prev) => {
      const currentHistoryIndex = prev.history.length - 1;
      const newState = {
        ...prev,
        choicesMade: { ...prev.choicesMade, [currentHistoryIndex]: choiceId },
      };

      if (nextNodeId) {
        return {
          ...newState,
          currentNodeId: nextNodeId,
          history: [...prev.history, nextNodeId],
        };
      }
      return { ...newState, currentNodeId: null };
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (!playState.currentNodeId) return;

    const current = nodes.find((n) => n.id === playState.currentNodeId);
    if (!current) return;

    // Handle choice node - select focused choice
    if (current.type === "choiceNode") {
      const choiceNode = current as ChoicesFlowNode;
      const historyIndex = playState.history.length - 1;
      if (playState.choicesMade[historyIndex]) return; // Already selected

      const selectedChoice = choiceNode.data.choices[focusedChoiceIndex];
      if (selectedChoice) {
        handleChoiceSelect(selectedChoice.next_node, selectedChoice.id);
      }
      return;
    }

    let nextId: string | null = null;

    if (current.type === "dialogNode") {
      nextId = getNextNodeId(current.id);
    } else if (current.type === "phylumNode") {
      const phylumNode = current as PhylumFlowNode;
      const sortedBranches = [...phylumNode.data.branches].sort((a, b) => b.priority - a.priority);

      for (const branch of sortedBranches) {
        if (evaluateNecessity(branch.necessities, variables)) {
          nextId = getNextNodeId(current.id, `branch-${branch.id}`) ?? branch.next_node;
          break;
        }
      }
    }

    if (nextId) {
      setPlayState((prev) => ({
        ...prev,
        currentNodeId: nextId,
        history: [...prev.history, nextId!],
      }));
    } else {
      setPlayState((prev) => ({ ...prev, currentNodeId: null }));
    }
  }, [playState.currentNodeId, playState.history, playState.choicesMade, nodes, getNextNodeId, variables, focusedChoiceIndex, handleChoiceSelect]);

  useKeyBinding(' ', () => {
    handleContinue();
    return true;
  }, { enabled: true, priority: KEYMAP_PRIO.CONTEXT_MENU });

  useKeyBinding('ArrowUp', () => {
    setFocusedChoiceIndex(prev => Math.max(0, prev - 1));
    return true;
  }, { enabled: isOnActiveChoiceNode, priority: KEYMAP_PRIO.CONTEXT_MENU });

  useKeyBinding('ArrowDown', () => {
    setFocusedChoiceIndex(prev => Math.min(choicesCount - 1, prev + 1));
    return true;
  }, { enabled: isOnActiveChoiceNode, priority: KEYMAP_PRIO.CONTEXT_MENU });

  const handleRestart = useCallback(() => {
    setPlayState({
      currentNodeId: rootNodeId,
      history: rootNodeId ? [rootNodeId] : [],
      choicesMade: {},
    });
  }, [rootNodeId]);

  // Auto-advance through phylum nodes
  useEffect(() => {
    if (variablesLoading) return;

    const current = nodes.find((n) => n.id === playState.currentNodeId);
    if (current?.type === "phylumNode") {
      handleContinue();
    }
  }, [playState.currentNodeId, nodes, handleContinue, variablesLoading]);

  useEffect(() => {
    setCurrentSpeaker(getLastSpeaker());
  }, [playState.history, nodes, dialog?.main_character, setCurrentSpeaker]);

  useEffect(() => {
    init();
  }, [dialog?.id, rootNodeId]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [playState.history]);

  if (isLoading || variablesLoading) {
    return <div className="flex h-full items-center justify-center text-text-subtle">Loading...</div>;
  }

  const visibleNodesWithIndex = playState.history
    .map((id, historyIndex) => ({ node: nodes.find((n) => n.id === id), historyIndex }))
    .filter((item): item is { node: AppNode; historyIndex: number } =>
      item.node != null && item.node.type !== "phylumNode"
    );

  const isEnded = playState.currentNodeId === null;

  return (
    <div className="dialog-feed-container">
      <div className="dialog-feed-gradient" />
      <div className="dialog-feed-content" ref={feedRef}>
        {visibleNodesWithIndex.map(({ node, historyIndex }, index) => {
          const isLast = index === visibleNodesWithIndex.length - 1 && !isEnded;
          const isFirst = index === 0;

          if (node.type === "dialogNode") {
            return (
              <PlayDialogNode
                key={`${node.id}-${historyIndex}`}
                node={node as DialogFlowNode}
                characterId={getCharacterIdForNode(node as DialogFlowNode, historyIndex)}
                isLast={isLast}
                isFirst={isFirst}
                project={project}
                onContinue={isLast ? handleContinue : undefined}
              />
            );
          }

          if (node.type === "choiceNode") {
            return (
              <PlayChoiceNode
                key={`${node.id}-${historyIndex}`}
                node={node as ChoicesFlowNode}
                isLast={isLast}
                isFirst={isFirst}
                selectedChoiceId={playState.choicesMade[historyIndex]}
                focusedIndex={isLast ? focusedChoiceIndex : undefined}
                onSelect={isLast ? handleChoiceSelect : undefined}
              />
            );
          }

          return null;
        })}

        {isEnded && <EndMessage onRestart={handleRestart} />}

        {visibleNodesWithIndex.length === 0 && !isEnded && (
          <div className="text-text-subtle text-sm italic">No dialog nodes</div>
        )}
      </div>
      <div className="dialog-feed-gradient-bottom" />
    </div>
  );
};
