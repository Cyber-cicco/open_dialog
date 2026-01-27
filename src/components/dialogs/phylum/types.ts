import { NecessityExpression } from "../../../bindings/NecessityExpression"
import { Result} from 'neverthrow';


export type ConditionProps = {
    harvester:Harvester
}

export type Harvester = {
    takes: Harvester
    gives: () => Result<NecessityExpression, string[]>
}
