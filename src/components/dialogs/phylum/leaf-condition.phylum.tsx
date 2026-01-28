import { useEffect, useState } from "react"
import { ConditionProps } from "./types"
import { err, ok } from "neverthrow"
import { StyledSelect } from "../../common/form/styled-select-nontanstack"

export const LeafCondition: React.FC<ConditionProps> = ({ harvester, vars }) => {
  const [varId, setVarId] = useState<string | undefined>(undefined)
  const [necessaryState, setNecessaryState] = useState<string | undefined>(undefined)

  const selectedVar = vars.find(v => v.id === varId)

  useEffect(() => {
    harvester.gives = () => {
      if (varId === undefined) return err(["Variable not selected"])
      if (necessaryState === undefined) return err(["Required state not selected"])
      return ok({ "Var": { var_id: varId, necessary_state: necessaryState } })
    }
  }, [harvester, varId, necessaryState])

  const varOptions = vars.map(v => ({ value: v.id, label: v.name }))
  const stateOptions = selectedVar?.potential_states?.map(s => ({ value: s, label: s })) 
    ?? [{ value: "true", label: "true" }, { value: "false", label: "false" }]

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-base-overlay rounded min-w-0">
      <StyledSelect
        value={varId}
        onChange={(v) => { setVarId(v); setNecessaryState(undefined) }}
        options={varOptions}
        placeholder="Select var..."
      />
      <span className="text-text-muted">=</span>
      <StyledSelect
        value={necessaryState}
        onChange={setNecessaryState}
        options={stateOptions}
        placeholder="Select state..."
        disabled={!selectedVar}
      />
    </div>
  )
}
