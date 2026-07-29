import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/+$/, "");
}

/**
 * Resolve um relacionamento Payload que pode ser um objeto populado, string (ID) ou number (ID).
 * Retorna o objeto tipado ou null se não estiver populado.
 */
export function resolveRelation<T>(value: T | string | number): T | null {
  if (typeof value === "object" && value !== null) return value as T;
  return null;
}
