import { NecessityExpression } from "../../../bindings/NecessityExpression"

export type ConditionProps = {
    harvest: (expressions:NecessityExpression[]) => NecessityExpression
}
