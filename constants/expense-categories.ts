import { Home, Car, Film, Lightbulb, ShoppingCart, HeartPulse, CreditCard } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Casa', icon: Home, color: 'oklch(0.72 0.17 162)' },
  { value: 'transport', label: 'Transporte', icon: Car, color: 'oklch(0.70 0.15 300)' },
  { value: 'entertainment', label: 'Entretenimiento', icon: Film, color: 'oklch(0.72 0.12 195)' },
  { value: 'utilities', label: 'Servicios', icon: Lightbulb, color: 'oklch(0.80 0.15 80)' },
  { value: 'food', label: 'Alimentación', icon: ShoppingCart, color: 'oklch(0.65 0.15 250)' },
  { value: 'health', label: 'Salud', icon: HeartPulse, color: 'oklch(0.63 0.21 25)' },
  { value: 'others', label: 'Otros', icon: CreditCard, color: 'oklch(0.60 0.10 260)' },
] as const;

export type ExpenseCategoryValue = typeof EXPENSE_CATEGORIES[number]['value'];

export function getCategoryByValue(value: string) {
  return EXPENSE_CATEGORIES.find(cat => cat.value === value);
}
