import { ChoicesFlowNode } from "../../context/dialog.context";
import { ChoiceSvg } from "../common/svg/choice.svg";

type ChoiceNodeItemProps = {
  node: ChoicesFlowNode;
  isLast: boolean;
  isFirst: boolean;
  nextNodeId?: string;
};

export const ChoiceNodeItem = ({ node, isLast, isFirst, nextNodeId }: ChoiceNodeItemProps) => {
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

