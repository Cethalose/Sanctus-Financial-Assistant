import { z } from "zod";

export const currencies = ["USD", "CAD", "EUR", "GBP"] as const;

const amount = z.coerce
  .number({ error: "Enter a valid number." })
  .finite("Enter a valid number.")
  .min(0, "Enter an amount of 0 or more.");

export const budgetInputSchema = z
  .object({
    monthlyIncome: amount,
    requiredExpenses: amount,
    flexibleExpenses: amount,
    savingsTarget: amount,
    currency: z.enum(currencies),
  })
  .refine((budget) => budget.monthlyIncome > 0, {
    path: ["monthlyIncome"],
    message: "Monthly income must be greater than 0.",
  });

export type BudgetInput = z.infer<typeof budgetInputSchema>;

export type BudgetSummary = BudgetInput & {
  totalExpenses: number;
  plannedOutflow: number;
  remainingBalance: number;
  savingsRate: number;
  state: "surplus" | "balanced" | "deficit";
  guidance: BudgetGuidance;
};

export type BudgetGuidance = {
  label: string;
  summary: string;
  nextStep: string;
};

export function summarizeBudget(input: BudgetInput): BudgetSummary {
  const budget = budgetInputSchema.parse(input);
  const totalExpenses = budget.requiredExpenses + budget.flexibleExpenses;
  const plannedOutflow = totalExpenses + budget.savingsTarget;
  const remainingBalance = budget.monthlyIncome - plannedOutflow;
  const savingsRate = budget.savingsTarget / budget.monthlyIncome;
  const state = labelBudgetState(remainingBalance);

  return {
    ...budget,
    totalExpenses,
    plannedOutflow,
    remainingBalance,
    savingsRate,
    state,
    guidance: getBudgetGuidance(state, remainingBalance, savingsRate),
  };
}

function labelBudgetState(remainingBalance: number): BudgetSummary["state"] {
  if (remainingBalance < 0) {
    return "deficit";
  }

  if (remainingBalance <= 25) {
    return "balanced";
  }

  return "surplus";
}

function getBudgetGuidance(
  state: BudgetSummary["state"],
  remainingBalance: number,
  savingsRate: number,
): BudgetGuidance {
  if (state === "deficit") {
    return {
      label: "Deficit",
      summary: `Planned spending exceeds income by ${Math.abs(remainingBalance).toFixed(0)} before the month starts.`,
      nextStep:
        "Reduce flexible expenses or lower the savings target until the remaining balance is non-negative.",
    };
  }

  if (state === "balanced") {
    return {
      label: "Balanced",
      summary: "Income is fully assigned across expenses and savings.",
      nextStep:
        savingsRate < 0.1
          ? "Look for a small flexible-expense reduction to bring savings closer to 10% of income."
          : "Track actual spending against this plan before adding complexity.",
    };
  }

  return {
    label: "Surplus",
    summary: `The plan leaves ${remainingBalance.toFixed(0)} unassigned after expenses and savings.`,
    nextStep:
      savingsRate < 0.15
        ? "Consider assigning part of the surplus to savings before increasing spending."
        : "Keep the surplus as a buffer or assign it to a specific goal.",
  };
}

export function formatMoney(amountValue: number, currency: BudgetInput["currency"]) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountValue);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}
