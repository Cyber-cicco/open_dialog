import { useMemo, useState, useCallback } from "react";
import { useGlobalState } from "../../context/global-state.context";
import { LocalVariable } from "../../hooks/useVariables";
import { useDialogContext } from "../../hooks/useDialog";
import { TinyModaleWrapper } from "../common/modal/modal-wrapper";
import { NecessityExpression } from "../../bindings/NecessityExpression";
import { UndefinedCondition } from "./phylum/undefined-condition";
import { Harvester } from "./phylum/types";
import { err } from "neverthrow";
import { Conditions } from "../../bindings/Conditions";

type Props = {
  condition: Conditions | undefined;
  nodeId: string;
  branchIndex: number;
  onClose: () => void;
};

export const PhylumConditionModale = ({ condition, nodeId, branchIndex, onClose }: Props) => {
  const { dialogToVars, globalVars } = useGlobalState();
  const { dialog, updateNodeData, nodes } = useDialogContext();
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState(condition?.name ?? "default");

  const vars = useMemo(() => {
    let res: LocalVariable[] = [];
    if (dialogToVars === undefined || globalVars === undefined || !dialog) {
      return res;
    }
    const currDialogVars = dialogToVars.get(dialog.id);
    if (currDialogVars !== undefined) {
      res.push(...currDialogVars);
    }
    res.push(...globalVars);
    return res;
  }, [dialogToVars, globalVars, dialog]);

  const rootHarvester: Harvester = useMemo(
    () => ({
      takes: null as unknown as Harvester,
      gives: () => err(["Condition not defined"]),
    }),
    []
  );

  const handleSave = useCallback(() => {
    const result = rootHarvester.gives();

    const necessities: NecessityExpression | null = result.isOk() ? result.value : null;
    console.log("necessities : ");
    console.log(necessities);

    if (result.isErr() && result.error[0] !== "Condition not defined") {
      console.log(result.error)
      setErrors(result.error);
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'phylumNode') return;

    console.log("here")
    const updatedBranches = [...node.data.branches];
    updatedBranches[branchIndex] = {
      ...updatedBranches[branchIndex],
      name,
      necessities,
    };
    console.log("here 2")

    updateNodeData(nodeId, { branches: updatedBranches });
    setErrors([]);
    onClose();
  }, [rootHarvester, name, nodeId, branchIndex, nodes, updateNodeData, onClose]);

  const handleClear = useCallback(() => {
    setErrors([]);
    onClose();
  }, [onClose]);

  return (
    <TinyModaleWrapper title="Condition" onClose={handleClear}>
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }} className="space-y-4 p-6 min-w-80">
        <div>
          <label className="block text-text-subtle text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-base-overlay/60 text-text-primary placeholder:text-text-muted px-3 py-2 rounded focus:outline-none focus:bg-highlight-low transition-colors"
            placeholder="Condition name..."
          />
        </div>

        <div className="max-h-92 overflow-y-auto overflow-x-hidden w-full">
          <label className="block text-text-subtle text-sm mb-1">Expression</label>
          <UndefinedCondition harvester={rootHarvester} vars={vars} />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-400/30 rounded p-2 text-sm text-red-400">
            {errors.map((e, i) => (
              <div key={i}>• {e}</div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-base-overlay">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm text-text-subtle hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-deep hover:bg-blue-primary text-text-primary rounded transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </TinyModaleWrapper>
  );
};
