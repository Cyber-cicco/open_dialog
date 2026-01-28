import { useState } from "react"
import { LeafCondition } from "./leaf-condition.phylum"
import { TreeCondition } from "./tree-condition.phylum"
import { ConditionProps } from "./types"

type ConditionType = "leaf" | "tree" | "undefined"

export const UndefinedCondition: React.FC<ConditionProps> = ({ harvester, vars }) => {
  const [conditionType, setConditionType] = useState<ConditionType>("undefined");

  if (conditionType === "leaf") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setConditionType("undefined")}
          className="absolute right-2 top-3 w-5 h-5 flex items-center justify-center rounded-full bg-base-overlay hover:bg-red-500/20 text-text-subtle hover:text-red-400 font-medium transition-colors hover:cursor-pointer"
        >×</button>
        <LeafCondition harvester={harvester} vars={vars} />
      </div>
    );
  }

  if (conditionType === "tree") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setConditionType("undefined")}
          className="absolute right-2 top-3  w-5 h-5 flex items-center justify-center rounded-full bg-base-overlay hover:bg-red-500/20 text-text-subtle hover:text-red-400 font-medium transition-colors hover:cursor-pointer"
        >×</button>
        <TreeCondition harvester={harvester} vars={vars} />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="px-3 py-1 bg-base-overlay hover:bg-highlight-low text-text-subtle text-sm rounded transition-colors"
        onClick={() => setConditionType("leaf")}
      >
        + Variable
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-base-overlay hover:bg-highlight-low text-text-subtle text-sm rounded transition-colors"
        onClick={() => setConditionType("tree")}
      >
        + Group
      </button>
    </div>
  );
}
