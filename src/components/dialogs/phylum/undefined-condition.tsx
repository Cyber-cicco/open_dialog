import { useState } from "react"
import { LeafCondition } from "./leaf-condition.phylum"
import { TreeCondition } from "./tree-condition.phylum"
import { ConditionProps } from "./types"
import { NecessityExpression } from "../../../bindings/NecessityExpression"

type ConditionType = "leaf" | "tree" | "undefined"

function getInitialType(initial?: NecessityExpression | null): ConditionType {
  if (!initial) return "undefined"
  if ("Var" in initial) return "leaf"
  if ("Tree" in initial) return "tree"
  return "undefined"
}

export const UndefinedCondition: React.FC<ConditionProps> = ({ harvester, vars, initial }) => {
  const [conditionType, setConditionType] = useState<ConditionType>(() => getInitialType(initial));

  if (conditionType === "leaf") {
    const leafInitial = initial && "Var" in initial ? initial.Var : undefined
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setConditionType("undefined")}
          className="absolute right-2 top-3 w-5 h-5 flex items-center justify-center rounded-full bg-base-overlay hover:bg-red-500/20 text-text-subtle hover:text-red-400 font-medium transition-colors hover:cursor-pointer"
        >×</button>
        <LeafCondition harvester={harvester} vars={vars} initial={leafInitial} />
      </div>
    );
  }

  if (conditionType === "tree") {
    const treeInitial = initial && "Tree" in initial ? initial.Tree : undefined
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setConditionType("undefined")}
          className="absolute right-2 top-3 w-5 h-5 flex items-center justify-center rounded-full bg-base-overlay hover:bg-red-500/20 text-text-subtle hover:text-red-400 font-medium transition-colors hover:cursor-pointer"
        >×</button>
        <TreeCondition harvester={harvester} vars={vars} initial={treeInitial} />
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
