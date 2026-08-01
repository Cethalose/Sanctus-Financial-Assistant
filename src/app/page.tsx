"use client";

import { ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadSavedBudget } from "../lib/browser-budget-store";

export default function HomePage() {
  const [hasBudget, setHasBudget] = useState<boolean | null>(null);

  useEffect(() => {
    setHasBudget(Boolean(loadSavedBudget()));
  }, []);

  const href = hasBudget ? "/dashboard" : "/onboarding";

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
          <p className="eyebrow">Tier 0 manual setup</p>
          <h1>Set the first monthly budget in minutes.</h1>
          <p className="copy">
            Capture income, required expenses, flexible spending, and a savings
            target before moving into the dashboard.
          </p>
          <div className="actions">
            <Link className="button" href={href}>
              <ArrowRight size={18} />
              Continue
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
