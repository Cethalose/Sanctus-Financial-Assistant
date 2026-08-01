"use client";

import { ClipboardList, Pencil, RotateCcw, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type BudgetInput, formatMoney, formatPercent, summarizeBudget } from "../../lib/budget";
import { clearBudget, loadSavedBudget } from "../../lib/browser-budget-store";

export default function DashboardPage() {
  const [budget, setBudget] = useState<BudgetInput | null>(null);

  useEffect(() => {
    setBudget(loadSavedBudget());
  }, []);

  const summary = useMemo(() => (budget ? summarizeBudget(budget) : null), [budget]);

  function resetBudget() {
    clearBudget();
    setBudget(null);
  }

  if (!summary) {
    return (
      <main className="shell">
        <div className="app-frame section">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <ClipboardList size={19} />
              </span>
              Sanctus Financial Assistant
            </div>
          </header>
          <section>
            <p className="eyebrow">No budget found</p>
            <h1>Start with the onboarding form.</h1>
            <p className="copy">A manual budget is required before dashboard guidance can render.</p>
            <div className="actions">
              <Link className="button" href="/onboarding">
                <Pencil size={18} />
                Create budget
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="app-frame section">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <ClipboardList size={19} />
            </span>
            Sanctus Financial Assistant
          </div>
          <div className={`status ${summary.state}`}>{summary.state}</div>
        </header>

        <section className="section">
          <div>
            <p className="eyebrow">Budget dashboard</p>
            <h1>{formatMoney(summary.remainingBalance, summary.currency)} remaining this month.</h1>
            <p className="copy">
              The saved first-time budget is summarized with deterministic Tier
              0 calculations.
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-body section">
                <div className="metrics">
                  <Metric label="Monthly income" value={formatMoney(summary.monthlyIncome, summary.currency)} />
                  <Metric label="Total expenses" value={formatMoney(summary.totalExpenses, summary.currency)} />
                  <Metric label="Savings target" value={formatMoney(summary.savingsTarget, summary.currency)} />
                  <Metric label="Savings rate" value={formatPercent(summary.savingsRate)} />
                </div>

                <div className="allocation" aria-label="Monthly budget allocation">
                  <div className="allocation-row">
                    <span>Required</span>
                    <strong>{formatMoney(summary.requiredExpenses, summary.currency)}</strong>
                  </div>
                  <div className="allocation-row">
                    <span>Flexible</span>
                    <strong>{formatMoney(summary.flexibleExpenses, summary.currency)}</strong>
                  </div>
                  <div className="allocation-row">
                    <span>Planned outflow</span>
                    <strong>{formatMoney(summary.plannedOutflow, summary.currency)}</strong>
                  </div>
                </div>

                <div className="actions">
                  <Link className="button" href="/onboarding">
                    <Pencil size={18} />
                    Edit budget
                  </Link>
                  <button className="button secondary" type="button" onClick={resetBudget}>
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <aside className="panel guidance" aria-label="Deterministic guidance">
              <div className="panel-body section">
                <div className="guidance-heading">
                  <span className="brand-mark" aria-hidden="true">
                    <WalletCards size={19} />
                  </span>
                  <div>
                    <p className="eyebrow">Deterministic guidance</p>
                    <h2>{summary.guidance.label}</h2>
                  </div>
                </div>
                <p className="copy">{summary.guidance.summary}</p>
                <p>{summary.guidance.nextStep}</p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
