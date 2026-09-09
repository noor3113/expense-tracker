import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, formatMoney, todayISO, type Category, type Expense } from "@/lib/expenses";

export function AddExpenseDialog({
  onAdd,
  defaultDate,
}: {
  onAdd: (e: Omit<Expense, "id">) => void;
  defaultDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(defaultDate ?? todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setAmount("");
    setNote("");
    setDate(defaultDate ?? todayISO());
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    onAdd({
      amount: Math.round(value * 100) / 100,
      category,
      date,
      note: note.trim() || undefined,
    });
    toast.success(`${formatMoney(value)} added to ${category}`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed right-5 bottom-5 z-40 h-14 rounded-full px-6 text-base shadow-[var(--shadow-card)] sm:right-8 sm:bottom-8"
        >
          <Plus className="size-5" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an expense</DialogTitle>
          <DialogDescription>Amount and category are all you really need.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              className="h-14 text-2xl font-semibold"
            />
            {error && <p className="text-sm text-warning">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="category" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Lunch with Sam"
                value={note}
                maxLength={60}
                onChange={(e) => setNote(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Save expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
