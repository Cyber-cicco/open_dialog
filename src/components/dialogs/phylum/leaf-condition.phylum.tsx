import { ConditionProps } from "./types"

export const LeafCondition: React.FC<ConditionProps> = ({ harvester }) => {
  harvester.gives = () => {
    return {"Var": {
      var_id: "caca",
      necessary_state:"liquide",
    }}
  }
  return (
    <></>
  )
}
