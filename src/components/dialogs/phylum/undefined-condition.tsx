import { useState } from "react"
import { Button } from "../../common/buttons/base.buttons"
import { LeafCondition } from "./leaf-condition"
import { TreeCondition } from "./tree-condition.phylum"

type ConditionType = "leaf" | "tree" | "undefined"
function getCondition(
  conditionType: ConditionType,
  setCondition: (conditionType: ConditionType) => void
) {
  switch (conditionType) {
    case "leaf": return <LeafCondition />
    case "tree": return <TreeCondition />
    case "undefined": return <UndefinedConditionInternal setCondition={setCondition} />
  }
}

export const UndefinedCondition = () => {
  const [conditionType, setConditionType] = useState<ConditionType>("undefined");
  return getCondition(conditionType, setConditionType)
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
