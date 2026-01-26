import { Project } from "../../bindings/Project";
import { DialogFlowNode } from "../../context/dialog.context";
import { useGetCharacterById } from "../../hooks/queries/character";

type DialogNodeItemProps = {
  node: DialogFlowNode;
  characterId: string;
  isLast: boolean;
  isFirst: boolean;
  project: Project | undefined;
};

export const DialogNodeItem = ({ node, characterId, isLast, isFirst, project }: DialogNodeItemProps) => {
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

