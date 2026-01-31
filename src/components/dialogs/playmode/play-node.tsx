import { Project } from "../../../bindings/Project";
import { DialogFlowNode } from "../../../context/dialog.context";
import { useGetCharacterById } from "../../../hooks/queries/character";



export const PlayDialogNode = ({
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
