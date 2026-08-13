import type { DynamicFieldCondition, DynamicFieldOperator } from './dynamic-field.model';

/**
 * Pure condition evaluator for `visibleWhen` / `disabledWhen` / `requiredWhen`.
 * Takes a resolver that returns the current value of a sibling field by key,
 * so the same logic works for runtime rendering and validator `when` logic.
 * No Angular dependency; keep it framework-free and unit-testable.
 *
 * Null/undefined semantics: an absent sibling value never matches `equals`
 * and fails `notEquals` only when it contradicts an explicit expected value.
 */
export type ConditionValueResolver = (fieldKey: string) => unknown;

export function evaluateCondition(
  condition: DynamicFieldCondition,
  resolveValue: ConditionValueResolver,
): boolean {
  if (condition.op) return evaluateOperator(condition.op, resolveValue);
  if (condition.and?.length) {
    return condition.and.every((c) => evaluateCondition(c, resolveValue));
  }
  if (condition.or?.length) {
    return condition.or.some((c) => evaluateCondition(c, resolveValue));
  }
  // An empty condition is treated as always-true.
  return true;
}

function evaluateOperator(
  operator: DynamicFieldOperator,
  resolveValue: ConditionValueResolver,
): boolean {
  const value = resolveValue(operator.fieldKey);
  if ('equals' in operator) {
    return Object.is(value, operator.equals);
  }
  if ('notEquals' in operator) {
    if (operator.notEquals === undefined) return value != null;
    return !Object.is(value, operator.notEquals);
  }
  // Operator present but no predicate => match on non-empty value.
  return value != null && value !== '';
}