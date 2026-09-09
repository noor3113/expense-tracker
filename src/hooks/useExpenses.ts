import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY, type Expense } from "@/lib/expenses";

function read(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Expense[]) : [];
  } catch {
    return [];
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(read());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Expense[]) => {
    setExpenses(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full or unavailable */
    }
  }, []);

  const addExpense = useCallback(
    (e: Omit<Expense, "id">) => {
      persist([{ ...e, id: crypto.randomUUID() }, ...read()]);
    },
    [persist],
  );

  const removeExpense = useCallback(
    (id: string) => persist(read().filter((e) => e.id !== id)),
    [persist],
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  return { expenses, loaded, addExpense, removeExpense, clearAll };
}
