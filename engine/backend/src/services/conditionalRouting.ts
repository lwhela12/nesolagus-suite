/**
 * Shared Conditional Routing Logic
 *
 * This module provides conditional routing evaluation for both preview and live survey modes.
 * Supports two formats:
 *
 * 1. Array-based format (new, from Studio):
 *    "next": {
 *      "if": [
 *        { "when": { "equals": "value" }, "goto": "b1a" },
 *        { "when": { "lt": 5 }, "goto": "b2a" }
 *      ],
 *      "else": "b3"
 *    }
 *
 * 2. Nested format (legacy, for backwards compatibility):
 *    "conditionalNext": {
 *      "if": { "variable": "choice_1", "equals": "value" },
 *      "then": "b1a",
 *      "else": "b3"
 *    }
 */

export interface ConditionalNextArray {
  if: Array<{
    when: Record<string, any>;
    goto: string;
  }>;
  else: string;
}

export interface ConditionalNextNested {
  if: Record<string, any>;
  then: string;
  else: string | ConditionalNextNested;
}

/**
 * Evaluate conditional routing and return the next block ID
 *
 * @param nextOrConditional - The "next" or "conditionalNext" field from the block
 * @param variables - Current survey state variables
 * @param blockVariable - The variable name from the current block (fallback if not specified in condition)
 * @returns The next block ID to navigate to, or null if no match
 */
export function evaluateConditionalNext(
  nextOrConditional: any,
  variables: Record<string, any>,
  blockVariable?: string
): string | null {
  if (!nextOrConditional) return null;

  // Detect format: array-based (new) vs nested (legacy)
  if (Array.isArray(nextOrConditional.if)) {
    // Array-based format from Studio
    return evaluateArrayFormat(nextOrConditional as ConditionalNextArray, variables, blockVariable);
  } else if (typeof nextOrConditional.if === 'object') {
    // Nested format (legacy)
    return evaluateNestedFormat(nextOrConditional as ConditionalNextNested, variables);
  }

  return null;
}

/**
 * Evaluate array-based conditional format (new Studio format)
 */
function evaluateArrayFormat(
  conditional: ConditionalNextArray,
  variables: Record<string, any>,
  blockVariable?: string
): string | null {
  // Iterate through conditions in order
  for (const rule of conditional.if) {
    if (evaluateCondition(rule.when, variables, blockVariable)) {
      return rule.goto;
    }
  }

  // No conditions matched, return else
  return conditional.else || null;
}

/**
 * Evaluate nested conditional format (legacy)
 */
function evaluateNestedFormat(
  conditional: ConditionalNextNested,
  variables: Record<string, any>
): string | null {
  if (evaluateCondition(conditional.if, variables)) {
    return conditional.then;
  } else {
    if (typeof conditional.else === 'object' && 'if' in conditional.else) {
      // Recursive nested else-if
      return evaluateNestedFormat(conditional.else, variables);
    } else {
      return conditional.else as string;
    }
  }
}

/**
 * Evaluate a single condition against variables
 *
 * Supports multiple formats:
 * - New format: { "lt": 5 } or { "equals": "value" } (uses fallbackVariable)
 * - Legacy format: { "variable": "foo", "lessThan": 5 }
 *
 * @param condition - The condition object
 * @param variables - Current survey state
 * @param fallbackVariable - Variable to check if not specified in condition (for new format)
 * @returns true if condition matches, false otherwise
 */
export function evaluateCondition(
  condition: any,
  variables: Record<string, any>,
  fallbackVariable?: string
): boolean {
  if (!condition) return false;

  // New format: { "lt": 5, "gt": 7, "equals": "value", "in": ["a", "b"] }
  // These operators check against the fallbackVariable (current block's variable)

  if ('lt' in condition) {
    const variable = condition.variable || fallbackVariable;
    if (!variable) return false;
    const value = variables[variable];
    return value !== undefined && Number(value) < Number(condition.lt);
  }

  if ('gt' in condition) {
    const variable = condition.variable || fallbackVariable;
    if (!variable) return false;
    const value = variables[variable];
    return value !== undefined && Number(value) > Number(condition.gt);
  }

  if ('equals' in condition) {
    const variable = condition.variable || fallbackVariable;
    if (!variable) return false;
    const value = variables[variable];

    // Handle array comparison
    if (Array.isArray(condition.equals) && Array.isArray(value)) {
      if (condition.equals.length !== value.length) return false;
      return condition.equals.every((v: any) => value.includes(v));
    }

    return value === condition.equals;
  }

  if ('in' in condition) {
    const variable = condition.variable || fallbackVariable;
    if (!variable) return false;
    const value = variables[variable];
    const allowedValues = Array.isArray(condition.in) ? condition.in : [condition.in];

    if (Array.isArray(value)) {
      // If value is array, check if any element is in allowed values
      return value.some((v: any) => allowedValues.includes(v));
    }

    return allowedValues.includes(value);
  }

  // Legacy format: { "variable": "foo", "lessThan": 5, "greaterThan": 7, etc. }
  // Variable is explicitly specified in the condition

  if (condition.variable) {
    const value = variables[condition.variable];

    if ('lessThan' in condition) {
      return value !== undefined && Number(value) < Number(condition.lessThan);
    }

    if ('greaterThan' in condition) {
      return value !== undefined && Number(value) > Number(condition.greaterThan);
    }

    if ('equals' in condition) {
      // Handle array comparison
      if (Array.isArray(condition.equals) && Array.isArray(value)) {
        if (condition.equals.length !== value.length) return false;
        return condition.equals.every((v: any) => value.includes(v));
      }

      return value === condition.equals;
    }

    if ('contains' in condition) {
      if (Array.isArray(value)) {
        return value.includes(condition.contains);
      }
      if (typeof value === 'string') {
        return value.includes(condition.contains);
      }
      return false;
    }
  }

  // Logical operators: not, or, and

  if ('not' in condition) {
    return !evaluateCondition(condition.not, variables, fallbackVariable);
  }

  if ('or' in condition && Array.isArray(condition.or)) {
    return condition.or.some((c: any) => evaluateCondition(c, variables, fallbackVariable));
  }

  if ('and' in condition && Array.isArray(condition.and)) {
    return condition.and.every((c: any) => evaluateCondition(c, variables, fallbackVariable));
  }

  return false;
}
