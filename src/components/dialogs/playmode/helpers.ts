import { NecessityExpression } from "../../../bindings/NecessityExpression";
import { Variable } from "../../../bindings/Variable";

// Evaluate a necessity expression against current variable states
export const evaluateNecessity = (
  expression: NecessityExpression | null,
  allVars: Variable[]
): boolean => {
  if (!expression) return true;

  if ("Var" in expression) {
    const { var_id, necessary_state } = expression.Var;
    for (const v of allVars) {
      if ("Global" in v && v.Global.id === var_id) {
        return v.Global.current_state === necessary_state;
      }
      if ("Char" in v && v.Char.id === var_id) {
        return v.Char.current_state === necessary_state;
      }
      if ("Dialog" in v && v.Dialog.id === var_id) {
        return v.Dialog.current_state === necessary_state;
      }
      if ("GlobalChar" in v && v.GlobalChar.id === var_id) {
        return v.GlobalChar.characters.some(c => c.current_state === necessary_state);
      }
    }
    return false;
  }

  if ("Tree" in expression) {
    const { left, operator, right } = expression.Tree;
    const leftResult = evaluateNecessity(left, allVars);
    const rightResult = evaluateNecessity(right, allVars);

    const op = operator.toLowerCase();
    if (op === "and" || op === "&&") return leftResult && rightResult;
    if (op === "or" || op === "||") return leftResult || rightResult;
    return false;
  }

  return false;
};
