import { NecessityExpression } from "../../../bindings/NecessityExpression"
import { Result} from 'neverthrow';
import { LocalVariable } from "../../../hooks/useVariables";


export type ConditionProps = {
    harvester:Harvester
    vars: LocalVariable[]
}

export type Harvester = {
    takes: Harvester
    gives: () => Result<NecessityExpression, string[]>
}
