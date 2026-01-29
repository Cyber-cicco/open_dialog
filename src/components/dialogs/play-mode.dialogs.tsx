import { useState, useEffect, useCallback, useRef } from "react";
import { useDialogContext } from "../../hooks/useDialog";
import { useGlobalState } from "../../context/global-state.context";
import { useGetCharacterById } from "../../hooks/queries/character";
import { DialogFlowNode, ChoicesFlowNode, PhylumFlowNode, AppNode } from "../../context/dialog.context";
import { Project } from "../../bindings/Project";
import { ChoiceSvg } from "../common/svg/choice.svg";
import { useRightPanel } from "../../context/right-panel.context";
import { NecessityExpression } from "../../bindings/NecessityExpression";
import { Variable } from "../../bindings/Variable";

type PlayState = {
  currentNodeId: string | null;
  history: string[];
  choicesMade: Record<number, string>;
};

// Evaluate a necessity expression against current variable states
const evaluateNecessity = (
  expression: NecessityExpression | null,
  allVars: Variable[]
): boolean => {
  if (!expression) return true; // null = default/fallback branch

  if ("Var" in expression) {
    const { var_id, necessary_state } = expression.Var;
    for (const v of allVars) {
      if ("Global" in v && v.Global.id === var_id) {
        return v.Global.current_state === necessary_state;
      }
      if ("Char" in v && v.Char.id === var_id) {
        return v.Char.current_state === necessary_state;
      }
      if ("Dialog" in v && v.Dialog.id === var_id) {
        return v.Dialog.current_state === necessary_state;
      }
      if ("GlobalChar" in v && v.GlobalChar.id === var_id) {
        return v.GlobalChar.characters.some(c => c.current_state === necessary_state);
      }
    }
    return false; // Variable not found
  }

  if ("Tree" in expression) {
    const { left, operator, right } = expression.Tree;
    const leftResult = evaluateNecessity(left, allVars);
    const rightResult = evaluateNecessity(right, allVars);

    const op = operator.toLowerCase();
    if (op === "and" || op === "&&") return leftResult && rightResult;
    if (op === "or" || op === "||") return leftResult || rightResult;
    return false;
  }

  return false;
};

const PlayDialogNode = ({
  node,
  characterId,
  isLast,
  isFirst,
  project,
  onContinue,
}: {
  node: DialogFlowNode;
  characterId: string;
  isLast: boolean;
  isFirst: boolean;
  project: Project | undefined;
  onContinue?: () => void;
}) => {
  const { data: character } = useGetCharacterById(project?.id ?? "", characterId);
  const { content } = node.data;

  return (
    <div>
      {isFirst && <div className="m-[50%]"></div>}
      <div
        className={`p-3 rounded border transition-all duration-200 text-lg ${isLast
          ? "bg-base-600 border-blue-deep text-text-100 shadow-lg shadow-blue-deep/20"
          : "bg-base-700/60 border-base-700 text-gray-300"
          }`}
      >
        {character && (
          <div className={`text-base font-medium mb-1 ${isLast ? "text-blue-primary" : "text-text-muted"}`}>
            {character.display_name}
          </div>
        )}
        <div className="whitespace-pre-wrap mb-3">
          {content || <span className="text-text-muted italic">Empty</span>}
        </div>
        {isLast && onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-2 px-4 bg-blue-deep hover:bg-blue-700 text-text-primary rounded transition-colors text-sm"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

const PlayChoiceNode = ({
  node,
  isLast,
  isFirst,
  selectedChoiceId,
  onSelect,
}: {
  node: ChoicesFlowNode;
  isLast: boolean;
  isFirst: boolean;
  selectedChoiceId?: string;
  onSelect?: (nextNodeId: string | null, choiceId: string) => void;
}) => {
  const { choices } = node.data;

  return (
    <div>
      {isFirst && <div className="m-[50%]"></div>}
      <div
        className={`p-3 rounded-lg border-2 border-dashed transition-all duration-200 text-lg ${isLast
          ? "bg-gold-deepest/20 border-gold-deep/60 shadow-lg shadow-gold-primary/10"
          : "bg-gold-deepest/10 border-gold-deepest/40"
          }`}
      >
        <div className={`flex items-center gap-2 text-sm font-medium mb-2 ${isLast ? "text-gold-primary" : "text-gold-deep/70"}`}>
          <ChoiceSvg />
          Choice
        </div>

        <div className="space-y-1.5">
          {choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const isClickable = isLast && onSelect && !selectedChoiceId;

            return (
              <button
                key={choice.id}
                onClick={() => isClickable && onSelect(choice.next_node, choice.id)}
                disabled={!isClickable}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-all ${isSelected
                  ? isLast
                    ? "bg-gold-deep/25 text-gold-light border-l-2 border-gold-primary"
                    : "bg-gold-deepest/30 text-gold-300 border-l-2 border-gold-deep"
                  : isClickable
                    ? "text-gold-light hover:bg-gold-deep/20 cursor-pointer"
                    : "text-text-muted opacity-50"
                  }`}
              >
                {choice.content || <span className="italic">Empty</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const EndMessage = ({ onRestart }: { onRestart: () => void }) => (
  <div className="p-3 rounded border border-base-700 bg-base-500 text-center">
    <div className="text-text-subtle mb-3">End of dialog</div>
    <button
      onClick={onRestart}
      className="py-2 px-4 bg-blue-deep hover:bg-blue-700 text-text-primary rounded transition-colors text-sm"
    >
      Restart
    </button>
  </div>
);

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

  const feedRef = useRef<HTMLDivElement>(null);

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

  const handleContinue = useCallback(() => {
    if (!playState.currentNodeId) return;

    const current = nodes.find((n) => n.id === playState.currentNodeId);
    if (!current) return;

    let nextId: string | null = null;

    if (current.type === "dialogNode") {
      nextId = getNextNodeId(current.id);
    } else if (current.type === "phylumNode") {
      const phylumNode = current as PhylumFlowNode;
      // Sort by priority descending (higher priority evaluated first)
      const sortedBranches = [...phylumNode.data.branches].sort((a, b) => b.priority - a.priority);

      for (const branch of sortedBranches) {
        if (evaluateNecessity(branch.necessities, variables)) {
          const branchIndex = phylumNode.data.branches.indexOf(branch);
          nextId = getNextNodeId(current.id, `branch-${branchIndex}`) ?? branch.next_node;
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
  }, [playState.currentNodeId, nodes, getNextNodeId, variables]);

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

  const handleRestart = useCallback(() => {
    setPlayState({
      currentNodeId: rootNodeId,
      history: rootNodeId ? [rootNodeId] : [],
      choicesMade: {},
    });
  }, [rootNodeId]);

  // Auto-advance through phylum nodes
  useEffect(() => {
    if (variablesLoading) return;  // Wait for variables to load

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
