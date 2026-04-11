import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1600298882283-0ea8b0a5c4a7?w=600";
  return url;
}
