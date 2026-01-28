import { useEffect, useMemo, useState } from "react"
import { ConditionProps, Harvester } from "./types"
import { UndefinedCondition } from "./undefined-condition"
import { err, ok } from "neverthrow"
import { Operator } from "../../../bindings/Operator"
import { StyledSelect } from "../../common/form/styled-select-nontanstack"

export const TreeCondition: React.FC<ConditionProps> = ({ harvester, vars }) => {
  const [operator, setOperator] = useState<Operator | undefined>(undefined)

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

  const operatorValue = operator ? ("And" in operator ? "and" : "or") : undefined

  return (
    <div className="border-l-2 border-blue-primary/30 pl-3 space-y-2">
      <UndefinedCondition harvester={leftHarvester} vars={vars} />
      <StyledSelect
        value={operatorValue}
        onChange={(v) => {
          if (v === "and") setOperator({ "And": [] })
          else if (v === "or") setOperator({ "Or": [] })
          else setOperator(undefined)
        }}
        options={[{ value: "and", label: "AND" }, { value: "or", label: "OR" }]}
        placeholder="Select operator..."
        className="w-full"
      />
      <UndefinedCondition harvester={rightHarvester} vars={vars} />
    </div>
  )
}
