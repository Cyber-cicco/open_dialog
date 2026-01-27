import { useMemo, useRef, useState } from "react";
import { Conditions } from "../../bindings/Conditions";
import { useGlobalState } from "../../context/global-state.context";
import { LocalVariable } from "../../hooks/useVariables";
import { useDialogContext } from "../../hooks/useDialog";
import { useAppForm } from "../../hooks/form";

export const PhylumConditionModale = ({ conditions }: { conditions: Conditions }) => {
  const { dialogToVars, globalVars } = useGlobalState();
  const { dialog } = useDialogContext();
  const [potentialStates, setPotentialStates] = useState<string[]>([]);
  const [selectedVar, setSelectedVar] = useState<LocalVariable | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const form = useAppForm({
    defaultValues: {
      variable:'',
      
    }
  })

  const vars = useMemo(() => {
    let res: LocalVariable[] = [];
    if (dialogToVars === undefined || globalVars === undefined || !dialog) {
      return res;
    }
    let currDialogVars = dialogToVars.get(dialog.id);
    if (currDialogVars !== undefined) {
      res.push(...currDialogVars);
    }
    res.push(...globalVars)
    return res
  }, [dialogToVars, globalVars])

  return (
    <div className="space-y-1">
      <label className="block text-sm text-text-subtle mb-1">
        Variable
      </label>
      {selectedVar &&
        <div className="flex items-center gap-3 bg-base-overlay px-3 py-2 rounded">
          <span className="text-text-primary flex-1">{selectedVar.name}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-text-muted hover:text-text-primary text-sm"
          >
            ✕
          </button>
        </div>

      }

    </div>
  )

}
