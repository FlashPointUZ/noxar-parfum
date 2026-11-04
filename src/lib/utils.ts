import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('uz-UZ')} so'm`;
}

export function generateOrderNumber(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `NOX-${random}`;
}
