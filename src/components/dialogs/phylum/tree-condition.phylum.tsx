import { useEffect, useMemo, useState } from "react"
import { ConditionProps, Harvester } from "./types"
import { UndefinedCondition } from "./undefined-condition"
import { err, ok } from "neverthrow"
import { StyledSelect } from "../../common/form/styled-select-nontanstack"

export const TreeCondition: React.FC<ConditionProps> = ({ harvester, vars }) => {
  const [operator, setOperator] = useState<string | undefined>(undefined)

  const leftHarvester: Harvester = useMemo(() => ({
    takes: harvester,
    gives: () => err(["Left branch undefined"])
  }), [harvester])

  const rightHarvester: Harvester = useMemo(() => ({
    takes: harvester,
    gives: () => err(["Right branch undefined"])
  }), [harvester])

  useEffect(() => {
    harvester.gives = () => {
      const leftResult = leftHarvester.gives()
      if (leftResult.isErr()) return leftResult
      if (operator === undefined) return err(["Operator not selected"])
      const rightResult = rightHarvester.gives()
      if (rightResult.isErr()) return rightResult
      return ok({ "Tree": { left: leftResult.value, operator, right: rightResult.value } })
    }
  }, [harvester, leftHarvester, rightHarvester, operator])

  return (
    <div className="border-l-2 border-blue-primary/30 pl-3 space-y-2">
      <UndefinedCondition harvester={leftHarvester} vars={vars} />
      <StyledSelect
        value={operator}
        onChange={(v) => {
          setOperator(v);
        }}
        options={[{ value: "and", label: "AND" }, { value: "or", label: "OR" }]}
        placeholder="Select operator..."
        className="w-full"
      />
      <UndefinedCondition harvester={rightHarvester} vars={vars} />
    </div>
  )
}
