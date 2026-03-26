import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { nl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Nog geen bod";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatExpiry(dateString: string): string {
  const date = new Date(dateString);
  const days = differenceInDays(date, new Date());
  
  if (days < 0) return "Verlopen";
  if (days === 0) return "Vervalt vandaag";
  return `Vervalt over ${days} ${days === 1 ? 'dag' : 'dagen'}`;
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: nl });
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "d MMMM yyyy 'om' HH:mm", { locale: nl });
}
