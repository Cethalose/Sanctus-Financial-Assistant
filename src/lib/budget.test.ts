import { describe, expect, it } from "vitest";
import { budgetInputSchema, summarizeBudget } from "./budget";

describe("budgetInputSchema", () => {
  it("accepts a complete manual budget", () => {
    const parsed = budgetInputSchema.parse({
      monthlyIncome: "5000",
      requiredExpenses: "2300",
      flexibleExpenses: "900",
      savingsTarget: "800",
      currency: "USD",
    });

    expect(parsed).toEqual({
      monthlyIncome: 5000,
      requiredExpenses: 2300,
      flexibleExpenses: 900,
      savingsTarget: 800,
      currency: "USD",
    });
  });

  it("rejects zero monthly income", () => {
    const result = budgetInputSchema.safeParse({
      monthlyIncome: 0,
      requiredExpenses: 100,
      flexibleExpenses: 100,
      savingsTarget: 100,
      currency: "USD",
    });

    expect(result.success).toBe(false);
  });
});

describe("summarizeBudget", () => {
  it("calculates outflow, remaining balance, savings rate, and state", () => {
    const summary = summarizeBudget({
      monthlyIncome: 5000,
      requiredExpenses: 2300,
      flexibleExpenses: 900,
      savingsTarget: 800,
      currency: "USD",
    });

    expect(summary.totalExpenses).toBe(3200);
    expect(summary.plannedOutflow).toBe(4000);
    expect(summary.remainingBalance).toBe(1000);
    expect(summary.savingsRate).toBe(0.16);
    expect(summary.state).toBe("surplus");
    expect(summary.guidance).toEqual({
      label: "Surplus",
      summary: "The plan leaves 1000 unassigned after expenses and savings.",
      nextStep: "Keep the surplus as a buffer or assign it to a specific goal.",
    });
  });

  it("labels negative monthly balance as deficit", () => {
    const summary = summarizeBudget({
      monthlyIncome: 3000,
      requiredExpenses: 2300,
      flexibleExpenses: 900,
      savingsTarget: 100,
      currency: "USD",
    });

    expect(summary.remainingBalance).toBe(-300);
    expect(summary.state).toBe("deficit");
    expect(summary.guidance.nextStep).toContain("Reduce flexible expenses");
  });

  it("labels near-zero monthly balance as balanced with savings guidance", () => {
    const summary = summarizeBudget({
      monthlyIncome: 5000,
      requiredExpenses: 3000,
      flexibleExpenses: 1500,
      savingsTarget: 485,
      currency: "USD",
    });

    expect(summary.remainingBalance).toBe(15);
    expect(summary.state).toBe("balanced");
    expect(summary.guidance.label).toBe("Balanced");
  });
});
