"use client";

import { ArrowRight, ClipboardList, DollarSign, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type BudgetInput, budgetInputSchema, currencies, formatMoney, summarizeBudget } from "../../lib/budget";
import { saveBudget } from "../../lib/browser-budget-store";

type FormState = Record<keyof BudgetInput, string>;
type FieldErrors = Partial<Record<keyof BudgetInput, string>>;

const initialForm: FormState = {
  monthlyIncome: "",
  requiredExpenses: "",
  flexibleExpenses: "",
  savingsTarget: "",
  currency: "USD",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const preview = useMemo(() => {
    const result = budgetInputSchema.safeParse(form);
    return result.success ? summarizeBudget(result.data) : null;
  }, [form]);

  function updateField(field: keyof BudgetInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const result = budgetInputSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof BudgetInput | undefined;
        if (field) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      setIsSaving(false);
      return;
    }

    saveBudget(result.data);
    router.push("/dashboard");
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
        </header>

        <section className="split">
          <div>
            <p className="eyebrow">First-time onboarding</p>
            <h1>Configure the starting budget.</h1>
            <p className="copy">
              Enter only the manual figures needed for the Tier 0 prototype:
              monthly income, expenses, target savings, and currency.
            </p>
            <div className="notice">
              No bank connections or account credentials are collected in this
              milestone.
            </div>
          </div>

          <form className="panel" onSubmit={submit} noValidate>
            <div className="panel-body section">
              <div>
                <h2>Monthly budget</h2>
                <p className="copy">
                  These totals create the first dashboard view after save.
                </p>
              </div>

              <div className="form-grid">
                <Field
                  error={errors.monthlyIncome}
                  icon={<DollarSign size={17} />}
                  label="Monthly income"
                  name="monthlyIncome"
                  onChange={updateField}
                  value={form.monthlyIncome}
                />
                <Field
                  error={errors.requiredExpenses}
                  icon={<WalletCards size={17} />}
                  label="Required expenses"
                  name="requiredExpenses"
                  onChange={updateField}
                  value={form.requiredExpenses}
                />
                <Field
                  error={errors.flexibleExpenses}
                  icon={<WalletCards size={17} />}
                  label="Flexible expenses"
                  name="flexibleExpenses"
                  onChange={updateField}
                  value={form.flexibleExpenses}
                />
                <Field
                  error={errors.savingsTarget}
                  icon={<DollarSign size={17} />}
                  label="Savings target"
                  name="savingsTarget"
                  onChange={updateField}
                  value={form.savingsTarget}
                />

                <div className="field full">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.currency}</span>
                </div>
              </div>

              {preview ? (
                <div className="metrics" aria-live="polite">
                  <div className="metric">
                    <span>Planned outflow</span>
                    <strong>{formatMoney(preview.plannedOutflow, preview.currency)}</strong>
                  </div>
                  <div className="metric">
                    <span>Remaining</span>
                    <strong>{formatMoney(preview.remainingBalance, preview.currency)}</strong>
                  </div>
                </div>
              ) : null}

              <div className="actions">
                <button className="button" type="submit" disabled={isSaving}>
                  <ArrowRight size={18} />
                  {isSaving ? "Saving" : "Save budget"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  error,
  icon,
  label,
  name,
  onChange,
  value,
}: {
  error?: string;
  icon: React.ReactNode;
  label: string;
  name: keyof BudgetInput;
  onChange: (field: keyof BudgetInput, value: string) => void;
  value: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div style={{ position: "relative" }}>
        <span
          aria-hidden="true"
          style={{ color: "var(--muted)", left: 12, position: "absolute", top: 14 }}
        >
          {icon}
        </span>
        <input
          id={name}
          inputMode="decimal"
          min="0"
          name={name}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder="0"
          style={{ paddingLeft: 38 }}
          type="number"
          value={value}
        />
      </div>
      <span className="error">{error}</span>
    </div>
  );
}
