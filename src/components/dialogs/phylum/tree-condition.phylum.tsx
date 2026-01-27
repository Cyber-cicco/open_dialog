import { NecessityExpression } from "../../../bindings/NecessityExpression"
import { ConditionProps, Harvester } from "./types"
import { UndefinedCondition } from "./undefined-condition"

export const TreeCondition: React.FC<ConditionProps> = ({ harvester }) => {

  const leftHarvester: Harvester = {
    takes: harvester,
    gives: () => undefined
  }

  const rightHarvester: Harvester = {
    takes: harvester,
    gives: () => undefined
  }

  harvester.gives = () => {
    return {
      "Tree": {
        left: leftHarvester.gives(),
        operator: { "And": [] },
        right: rightHarvester.gives(),
      }
    } as NecessityExpression
  }

  return (
    <div className="space-y-1">
      <UndefinedCondition harvester={leftHarvester} />

      <UndefinedCondition harvester={rightHarvester} />
    </div>
  )
}
