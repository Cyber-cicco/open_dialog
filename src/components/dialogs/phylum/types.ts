import { NecessityExpression } from "../../../bindings/NecessityExpression"

export type ConditionProps = {
    harvester:Harvester
}

export type Harvester = {
    takes: Harvester
    gives: () => NecessityExpression | undefined
}
