import { useDialogContext } from "../../context/dialog.context";
import { useGlobalState } from "../../context/global-state.context";
import { useGetCharacterById } from "../../hooks/queries/character";
import { DialogFlowNode } from "../../context/dialog.context";
import { Project } from "../../bindings/Project";

type DialogNodeItemProps = {
  node: DialogFlowNode
  characterId: string
  isLast: boolean
  isFirst: boolean
  project: Project | undefined
}

const DialogNodeItem = ({ node, characterId, isLast, isFirst, project }: DialogNodeItemProps) => {
  const { data: character } = useGetCharacterById(project?.id ?? "", characterId);

  const { content } = node.data;

  return (
    <div>
      {isFirst && <div className="m-[50%]"></div>}
      <div
        className={`p-3 rounded border transition-all duration-200 text-lg ${
          isLast
            ? "bg-base-600 border-blue-deep text-text-100 shadow-lg shadow-blue-deep/20"
            : "bg-base-700/60 border-base-700 text-gray-300"
        }`}
      >
        {character && (
          <div
            className={`text-base font-medium mb-1 ${
              isLast ? "text-blue-primary" : "text-text-muted"
            }`}
          >
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

const DialogFeed = () => {
  const { dialogFeed: nodes, dialog } = useDialogContext();
  const {project} = useGlobalState();

  const dialogNodes = nodes.filter((node) => node.type === "dialogNode");

  const lastCharacterId = (() => {
    for (let i = dialogNodes.length - 1; i >= 0; i--) {
      const charId = dialogNodes[i]?.data.character_id;
      if (charId) return charId;
    }
    return dialog?.main_character ?? "";
  })();

  const getCharacterIdForNode = (index: number): string => {
    const currentCharId = dialogNodes[index]?.data.character_id;
    if (currentCharId) return currentCharId;

    for (let i = index - 1; i >= 0; i--) {
      const charId = dialogNodes[i]?.data.character_id;
      if (charId) return charId;
    }

    return dialog?.main_character ?? "";
  };

  return (
    <div className="dialog-feed-container">
      <div className="dialog-feed-gradient" />
      <div className="dialog-feed-content">
        {dialogNodes.map((node, index) => (
          <DialogNodeItem
            project={project}
            key={node.id}
            node={node}
            characterId={getCharacterIdForNode(index)}
            isLast={index === dialogNodes.length - 1}
            isFirst={index === 0}
          />
        ))}

        {dialogNodes.length === 0 && (
          <div className="text-text-subtle text-sm italic">No dialog nodes</div>
        )}
      </div>
      <div className="dialog-feed-gradient-bottom" />
    </div>
  );
};

export default DialogFeed;
