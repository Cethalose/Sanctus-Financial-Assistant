import { budgetInputSchema, type BudgetInput } from "./budget";

const budgetKey = "sanctus:first-budget";

export function loadSavedBudget(): BudgetInput | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawBudget = window.localStorage.getItem(budgetKey);

  if (!rawBudget) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawBudget);
    const result = budgetInputSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveBudget(budget: BudgetInput) {
  const parsed = budgetInputSchema.parse(budget);
  window.localStorage.setItem(budgetKey, JSON.stringify(parsed));
}

export function clearBudget() {
  window.localStorage.removeItem(budgetKey);
}
