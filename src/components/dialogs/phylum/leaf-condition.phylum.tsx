import { useEffect, useState } from "react"
import { ConditionProps } from "./types"
import { err, ok } from "neverthrow";

export const LeafCondition: React.FC<ConditionProps> = ({ harvester }) => {
  const [varId, setVarId] = useState<string | undefined>(undefined);
  const [necessaryState, setNecessaryState] = useState<string | undefined>(undefined);
  useEffect(() => {
    harvester.gives = () => {
      if (varId === undefined) {
        return err(["var was not chosen"])
      }
      if (necessaryState === undefined) {
        return err(["necessary state was not chosen"])
      }
      return ok({
        "Var": {
          var_id: varId,
          necessary_state: necessaryState,
        }
      })
    }
  }, [harvester, varId, necessaryState])

  return (
    <></>
  )
}
