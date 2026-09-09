export const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Rent",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  note?: string;
};

export const STORAGE_KEY = "budgetlens.expenses.v1";

/* ---------- date helpers (all string based, no timezone drift) ---------- */

export function monthKey(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

export function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseKey(key: string): [number, number] {
  const parts = key.split("-");
  return [Number(parts[0] ?? 0), Number(parts[1] ?? 1)];
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = parseKey(key);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = total % 12;
  return `${ny}-${`${nm + 1}`.padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [y, m] = parseKey(key);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function daysInMonth(key: string): number {
  const [y, m] = parseKey(key);
  return new Date(y, m, 0).getDate();
}

export function formatMoney(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

/* ---------- aggregation ---------- */

export function expensesForMonth(all: Expense[], key: string): Expense[] {
  return all.filter((e) => monthKey(e.date) === key);
}

export function total(list: Expense[]): number {
  return list.reduce((s, e) => s + e.amount, 0);
}

export function categoryTotals(list: Expense[]): { category: Category; amount: number }[] {
  const map = new Map<Category, number>();
  for (const e of list) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function dailyTotals(list: Expense[], key: string): { day: number; amount: number }[] {
  const n = daysInMonth(key);
  const out = Array.from({ length: n }, (_, i) => ({ day: i + 1, amount: 0 }));
  for (const e of list) {
    const d = Number(e.date.slice(8, 10));
    const slot = out[d - 1];
    if (slot) slot.amount += e.amount;
  }
  return out;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/* ---------- insights ---------- */

export type Insight = { id: string; text: string; tone: "good" | "warn" | "neutral" };

export function buildInsights(all: Expense[], key: string, now = todayISO()): Insight[] {
  const cur = expensesForMonth(all, key);
  const prev = expensesForMonth(all, shiftMonth(key, -1));
  const curTotal = total(cur);
  const prevTotal = total(prev);
  const insights: Insight[] = [];

  if (cur.length === 0) {
    return [
      {
        id: "empty",
        text: "No expenses logged for this month yet. Add one to see your insights.",
        tone: "neutral",
      },
    ];
  }

  const curCats = categoryTotals(cur);
  const top = curCats[0]!;
  insights.push({
    id: "top",
    text: `You've spent the most on ${top.category} this month — ${formatMoney(top.amount)} (${Math.round(
      (top.amount / curTotal) * 100,
    )}% of your spending).`,
    tone: "neutral",
  });

  // biggest category change vs last month
  const prevMap = new Map(categoryTotals(prev).map((c) => [c.category, c.amount]));
  let biggest: { category: Category; pct: number } | null = null;
  for (const c of curCats) {
    const p = prevMap.get(c.category) ?? 0;
    const pct = percentChange(c.amount, p);
    if (pct === null) continue;
    if (!biggest || Math.abs(pct) > Math.abs(biggest.pct)) biggest = { category: c.category, pct };
  }
  if (biggest && Math.abs(biggest.pct) >= 5) {
    const up = biggest.pct > 0;
    insights.push({
      id: "catchange",
      text: `Your spending on ${biggest.category} ${up ? "increased" : "decreased"} by ${Math.abs(
        Math.round(biggest.pct),
      )}% compared to last month.`,
      tone: up ? "warn" : "good",
    });
  }

  // pace projection — only meaningful for the month in progress
  const isCurrentMonth = key === monthKey(now);
  const dim = daysInMonth(key);
  const dayOfMonth = isCurrentMonth ? Number(now.slice(8, 10)) : dim;
  if (prevTotal > 0 && isCurrentMonth && dayOfMonth >= 3 && dayOfMonth < dim) {
    const projected = (curTotal / dayOfMonth) * dim;
    if (projected > prevTotal * 1.05) {
      insights.push({
        id: "pace",
        text: `You're on track to spend about ${formatMoney(
          Math.round(projected),
        )} — more than last month's ${formatMoney(prevTotal)} — if this pace continues.`,
        tone: "warn",
      });
    } else if (projected < prevTotal * 0.95) {
      insights.push({
        id: "pace",
        text: `At this pace you'll finish around ${formatMoney(
          Math.round(projected),
        )}, less than last month's ${formatMoney(prevTotal)}. Nicely done.`,
        tone: "good",
      });
    }
  }

  // a category used last month but untouched this month
  const untouched = [...prevMap.keys()].filter((c) => !curCats.some((x) => x.category === c));
  if (untouched.length > 0) {
    insights.push({
      id: "untouched",
      text: `No expenses logged in ${untouched.slice(0, 2).join(" or ")} this month — nice!`,
      tone: "good",
    });
  }

  // biggest single expense
  const largest = [...cur].sort((a, b) => b.amount - a.amount)[0]!;
  if (cur.length >= 3) {
    insights.push({
      id: "largest",
      text: `Your largest single expense was ${formatMoney(largest.amount)} on ${largest.category}.`,
      tone: "neutral",
    });
  }

  return insights;
}
