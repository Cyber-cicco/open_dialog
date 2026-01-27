import { useState } from "react"
import { Button } from "../../common/buttons/base.buttons"
import { LeafCondition } from "./leaf-condition.phylum"
import { TreeCondition } from "./tree-condition.phylum"
import { ConditionProps } from "./types"

type ConditionType = "leaf" | "tree" | "undefined"

export const UndefinedCondition: React.FC<ConditionProps> = ({ harvester }) => {
  const [conditionType, setConditionType] = useState<ConditionType>("undefined");
  return (
    <>
      {conditionType == 'leaf' && <LeafCondition harvester={harvester} />}
      {conditionType == 'tree' && <TreeCondition harvester={harvester} />}
      {conditionType == 'undefined' && <UndefinedConditionInternal setCondition={setConditionType} />}
    </>
  )
}

type UndefinedConditionInternalProps = {
  setCondition: (conditionType: ConditionType) => void
}

const UndefinedConditionInternal: React.FC<UndefinedConditionInternalProps> = ({ setCondition }) => {
  return (
    <div className="space-y-1">
      <Button onClick={() => {
        setCondition("leaf");
      }}>Leaf</Button>
      <Button onClick={() => {
        setCondition("tree");
      }}>Tree</Button>
    </div>
  )
}
