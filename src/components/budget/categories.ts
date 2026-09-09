import {
  Utensils,
  Bus,
  Receipt,
  ShoppingBag,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Home,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/expenses";

export const CATEGORY_META: Record<Category, { icon: LucideIcon; color: string }> = {
  Food: { icon: Utensils, color: "var(--chart-1)" },
  Transport: { icon: Bus, color: "var(--chart-2)" },
  Bills: { icon: Receipt, color: "var(--chart-3)" },
  Shopping: { icon: ShoppingBag, color: "var(--chart-4)" },
  Entertainment: { icon: Clapperboard, color: "var(--chart-5)" },
  Health: { icon: HeartPulse, color: "var(--chart-6)" },
  Education: { icon: GraduationCap, color: "var(--chart-7)" },
  Rent: { icon: Home, color: "var(--chart-8)" },
  Other: { icon: CircleDollarSign, color: "var(--chart-9)" },
};
