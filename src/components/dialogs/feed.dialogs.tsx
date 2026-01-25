import { useGlobalState } from "../../context/global-state.context";
import { useGetCharacterById } from "../../hooks/queries/character";
import { DialogFlowNode, ChoicesFlowNode, AppNode } from "../../context/dialog.context";
import { Project } from "../../bindings/Project";
import { useDialogContext } from "../../hooks/useDialog";
import { ChoiceSvg } from "../common/svg/choice.svg";

type DialogNodeItemProps = {
  node: DialogFlowNode;
  characterId: string;
  isLast: boolean;
  isFirst: boolean;
  project: Project | undefined;
};

const DialogNodeItem = ({ node, characterId, isLast, isFirst, project }: DialogNodeItemProps) => {
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
        <div className="whitespace-pre-wrap">
          {content || <span className="text-text-muted italic">Empty</span>}
        </div>
      </div>
    </div>
  );
};

// Updated ChoiceNodeItem in feed.dialogs.tsx

type ChoiceNodeItemProps = {
  node: ChoicesFlowNode;
  isLast: boolean;
  isFirst: boolean;
  nextNodeId?: string;
};

// In feed.dialogs.tsx - replace ChoiceNodeItem

const ChoiceNodeItem = ({ node, isLast, isFirst, nextNodeId }: ChoiceNodeItemProps) => {
  const { choices } = node.data;

  const selectedChoice = nextNodeId
    ? choices.find(c => c.next_node === nextNodeId)
    : null;

  return (
    <div>
      {isFirst && <div className="m-[50%]"></div>}
      <div
        className={`p-3 rounded-lg border-2 border-dashed transition-all duration-200 text-lg ${
          isLast
            ? "bg-gold-deepest/20 border-gold-deep/60 shadow-lg shadow-gold-primary/10"
            : "bg-gold-deepest/10 border-gold-deepest/40"
        }`}
      >
        <div className={`flex items-center gap-2 text-sm font-medium mb-2 ${
          isLast ? "text-gold-primary" : "text-gold-deep/70"
        }`}>
          <ChoiceSvg />
          Choice
        </div>

        <div className="space-y-1.5">
          {choices.map((choice) => {
            const isSelected = selectedChoice?.id === choice.id;
            return (
              <div
                key={choice.id}
                className={`px-3 py-1.5 rounded text-sm transition-all ${
                  isSelected
                    ? isLast
                      ? "bg-gold-deep/25 text-gold-light border-l-2 border-gold-primary"
                      : "bg-gold-deepest/30 text-gold-300 border-l-2 border-gold-deep"
                    : "text-text-muted opacity-50"
                }`}
              >
                {choice.content || <span className="italic">Empty</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DialogFeed = () => {
  const { dialogFeed: nodes, dialog } = useDialogContext();
  const { project } = useGlobalState();

  // Build character lookup for dialog nodes only
  const getCharacterIdForNode = (node: DialogFlowNode, index: number, allNodes: AppNode[]): string => {
    if (node.data.character_id) return node.data.character_id;

    // Walk back through all nodes to find last character
    for (let i = index - 1; i >= 0; i--) {
      const prev = allNodes[i];
      if (prev?.type === "dialogNode") {
        const charId = (prev as DialogFlowNode).data.character_id;
        if (charId) return charId;
      }
    }

    return dialog?.main_character ?? "";
  };

  return (
    <div className="dialog-feed-container">
      <div className="dialog-feed-gradient" />
      <div className="dialog-feed-content">
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          const isFirst = index === 0;

          if (node.type === "dialogNode") {
            return (
              <DialogNodeItem
                key={node.id}
                project={project}
                node={node as DialogFlowNode}
                characterId={getCharacterIdForNode(node as DialogFlowNode, index, nodes)}
                isLast={isLast}
                isFirst={isFirst}
              />
            );
          }

          if (node.type === "choiceNode") {
            const nextNode = nodes[index + 1];
            return (
              <ChoiceNodeItem
                key={node.id}
                node={node as ChoicesFlowNode}
                isLast={isLast}
                isFirst={isFirst}
                nextNodeId={nextNode?.id}
              />
            );
          }

          return null;
        })}

        {nodes.length === 0 && (
          <div className="text-text-subtle text-sm italic">No dialog nodes</div>
        )}
      </div>
      <div className="dialog-feed-gradient-bottom" />
    </div>
  );
};

export default DialogFeed;
