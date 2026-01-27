import { useEffect, useMemo, useState } from "react"
import { ConditionProps, Harvester } from "./types"
import { UndefinedCondition } from "./undefined-condition"
import { err } from "neverthrow"
import { Operator } from "../../../bindings/Operator"

export const TreeCondition: React.FC<ConditionProps> = ({ harvester }) => {

  const [operator, setOperator] = useState<Operator | undefined>(undefined)

  const leftHarvester: Harvester = useMemo(() => {
    return {
      takes: harvester,
      gives: () => err(["undefined tree branch"])
    }
  }, [harvester])

  const rightHarvester: Harvester = useMemo(() => {
    return {
      takes: harvester,
      gives: () => err(["undefined tree branch"])
    }
  }, [harvester])

  useEffect(() => {
    harvester.gives = () => {
      return leftHarvester
        .gives()
        .andThen((left) => {
          if (operator === undefined) {
            return err(["operator was not defined on tree"])
          }
          return rightHarvester
            .gives()
            .map((right) => {
              return {
                "Tree": {
                  left: left,
                  operator: operator,
                  right: right,
                }
              }
            })
        })
    }

  }, [harvester, leftHarvester, rightHarvester, operator])

  return (
    <div className="space-y-1">
      <UndefinedCondition harvester={leftHarvester} />

      <UndefinedCondition harvester={rightHarvester} />
    </div>
  )
}
