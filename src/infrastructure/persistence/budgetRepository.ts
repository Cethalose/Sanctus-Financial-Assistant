import type { BudgetInput } from "@/lib/budget";

export type StoredBudget = BudgetInput & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetRepository = {
  getActiveBudget(userId: string): Promise<StoredBudget | null>;
  upsertActiveBudget(userId: string, budget: BudgetInput): Promise<StoredBudget>;
};

export class SupabaseBudgetRepository implements BudgetRepository {
  async getActiveBudget(): Promise<StoredBudget | null> {
    throw new Error("Supabase budget reads are implemented in Milestone C.");
  }

  async upsertActiveBudget(): Promise<StoredBudget> {
    throw new Error("Supabase budget writes are implemented in Milestone C.");
  }
}
