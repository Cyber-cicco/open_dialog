import { ChoicesFlowNode } from "../../../context/dialog.context";
import { ChoiceSvg } from "../../common/svg/choice.svg";


export const PlayChoiceNode = ({
  node,
  isLast,
  isFirst,
  selectedChoiceId,
  focusedIndex,
  onSelect,
}: {
  node: ChoicesFlowNode;
  isLast: boolean;
  isFirst: boolean;
  selectedChoiceId?: string;
  focusedIndex?: number;
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
          {choices.map((choice, index) => {
            const isSelected = selectedChoiceId === choice.id;
            const isFocused = isLast && !selectedChoiceId && focusedIndex === index;
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
                  : isFocused
                    ? "bg-gold-deep/30 text-gold-light border-l-2 border-gold-primary"
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
