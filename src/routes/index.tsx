import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Minus,
  Trash2,
  Wallet,
} from "lucide-react";
import { AddExpenseDialog } from "@/components/budget/AddExpenseDialog";
import { CategoryDonut, DailyBars } from "@/components/budget/Charts";
import { SettingsMenu } from "@/components/budget/SettingsMenu";
import { CATEGORY_META } from "@/components/budget/categories";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import {
  buildInsights,
  categoryTotals,
  dailyTotals,
  expensesForMonth,
  formatMoney,
  monthKey,
  monthLabel,
  percentChange,
  shiftMonth,
  todayISO,
  total,
} from "@/lib/expenses";

const TITLE = "BudgetLens — See where your money goes";
const DESCRIPTION =
  "A simple, visual expense tracker. Log spending in seconds and get plain-language insights, charts and monthly comparisons — no spreadsheets required.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BudgetLens,
});

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={`rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function BudgetLens() {
  const { expenses, loaded, addExpense, removeExpense, clearAll } = useExpenses();
  const today = todayISO();
  const [month, setMonth] = useState(() => monthKey(todayISO()));

  const view = useMemo(() => {
    const current = expensesForMonth(expenses, month);
    const previous = expensesForMonth(expenses, shiftMonth(month, -1));
    const curTotal = total(current);
    const prevTotal = total(previous);
    return {
      current,
      curTotal,
      prevTotal,
      change: percentChange(curTotal, prevTotal),
      cats: categoryTotals(current),
      daily: dailyTotals(current, month),
      insights: buildInsights(expenses, month, today),
      recent: [...current].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8),
    };
  }, [expenses, month, today]);

  const isCurrentMonth = month === monthKey(today);
  const maxCat = view.cats[0]?.amount ?? 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Budget<span className="text-primary">Lens</span>
            </span>
          </div>
          <SettingsMenu expenses={expenses} onClear={clearAll} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        {/* Month selector + total */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous month"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">{monthLabel(month)}</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {formatMoney(view.curTotal)}
              </p>
              <ComparisonPill change={view.change} prevTotal={view.prevTotal} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next month"
              disabled={isCurrentMonth}
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </Card>

        {/* Insights */}
        <Card className="bg-primary-soft/60">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-accent-foreground uppercase">
            <Lightbulb className="size-4" /> Insights
          </h2>
          <ul className="mt-3 space-y-2.5">
            {view.insights.map((i) => (
              <li
                key={i.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  i.tone === "warn"
                    ? "bg-warning-soft text-foreground"
                    : "bg-card text-card-foreground"
                }`}
              >
                {i.text}
              </li>
            ))}
          </ul>
        </Card>

        {loaded && view.current.length === 0 ? (
          <Card className="text-center">
            <p className="text-base font-medium text-foreground">Nothing logged this month yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap “Add Expense” and BudgetLens does the maths for you.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h2 className="text-base font-semibold text-foreground">Where it went</h2>
                <p className="text-sm text-muted-foreground">Spending by category</p>
                <CategoryDonut data={view.cats} />
              </Card>
              <Card>
                <h2 className="text-base font-semibold text-foreground">Daily spending</h2>
                <p className="text-sm text-muted-foreground">Every day this month</p>
                <DailyBars data={view.daily} />
              </Card>
            </div>

            {/* Category breakdown */}
            <Card>
              <h2 className="text-base font-semibold text-foreground">Category breakdown</h2>
              <ul className="mt-4 space-y-4">
                {view.cats.map(({ category, amount }) => {
                  const Icon = CATEGORY_META[category].icon;
                  return (
                    <li key={category}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <Icon className="size-4 text-muted-foreground" />
                          {category}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatMoney(amount)} · {Math.round((amount / view.curTotal) * 100)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${maxCat ? (amount / maxCat) * 100 : 0}%`,
                            backgroundColor: CATEGORY_META[category].color,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Recent expenses */}
            <Card>
              <h2 className="text-base font-semibold text-foreground">Recent expenses</h2>
              <ul className="mt-3 divide-y divide-border">
                {view.recent.map((e) => {
                  const Icon = CATEGORY_META[e.category].icon;
                  return (
                    <li key={e.id} className="group flex items-center gap-3 py-3">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: CATEGORY_META[e.category].color + "22" }}
                      >
                        <Icon
                          className="size-4.5"
                          style={{ color: CATEGORY_META[e.category].color }}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {e.category}
                          {e.note ? (
                            <span className="font-normal text-muted-foreground"> · {e.note}</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(`${e.date}T00:00:00`).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatMoney(e.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete expense"
                        className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={() => removeExpense(e.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </>
        )}
      </main>

      <AddExpenseDialog onAdd={addExpense} {...(isCurrentMonth ? {} : { defaultDate: `${month}-01` })} />
    </div>
  );
}

function ComparisonPill({ change, prevTotal }: { change: number | null; prevTotal: number }) {
  if (change === null) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <Minus className="size-3.5" /> No spending last month to compare
      </p>
    );
  }
  const up = change > 0.5;
  const down = change < -0.5;
  const pct = Math.abs(Math.round(change));
  return (
    <p
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        up ? "bg-warning-soft text-warning" : down ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
      }`}
    >
      {up ? <ArrowUpRight className="size-3.5" /> : down ? <ArrowDownRight className="size-3.5" /> : <Minus className="size-3.5" />}
      {up
        ? `You've spent ${pct}% more than last month`
        : down
          ? `You've spent ${pct}% less than last month`
          : `About the same as last month (${formatMoney(prevTotal)})`}
    </p>
  );
}
