// phylum-condition-modal.dialogs.tsx
import { useMemo, useState, useCallback } from "react";
import { useGlobalState } from "../../context/global-state.context";
import { LocalVariable } from "../../hooks/useVariables";
import { useDialogContext } from "../../hooks/useDialog";
import { TinyModaleWrapper } from "../common/modal/modal-wrapper";
import { NecessityExpression } from "../../bindings/NecessityExpression";
import { UndefinedCondition } from "./phylum/undefined-condition";
import { Harvester } from "./phylum/types";
import { err } from "neverthrow";

type Props = {
  necessity: NecessityExpression | undefined;
  onClose: () => void;
};

export const PhylumConditionModale = ({ necessity, onClose }: Props) => {
  const { dialogToVars, globalVars } = useGlobalState();
  const { dialog } = useDialogContext();
  const [errors, setErrors] = useState<string[]>([]);

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

  const onSave = (exp:NecessityExpression) => {
    console.log(exp);
  }

  const handleSave = useCallback(() => {
    const result = rootHarvester.gives();
    if (result.isErr()) {
      setErrors(result.error);
      return;
    }
    setErrors([]);
    onSave(result.value);
    onClose();
  }, [rootHarvester, onSave, onClose]);

  const handleClear = useCallback(() => {
    setErrors([]);
    onClose();
  }, [onClose]);

  return (
    <TinyModaleWrapper title="Condition" onClose={handleClear}>
      <div className="space-y-4 p-6 min-w-80">
        <UndefinedCondition harvester={rootHarvester} vars={vars} />

        {errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-400/30 rounded p-2 text-sm text-red-400">
            {errors.map((e, i) => (
              <div key={i}>• {e}</div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-base-overlay">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-text-subtle hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-deep hover:bg-blue-primary text-text-primary rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </TinyModaleWrapper>
  );
};
