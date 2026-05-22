import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve um relacionamento Payload que pode ser um objeto populado, string (ID) ou number (ID).
 * Retorna o objeto tipado ou null se não estiver populado.
 */
export function resolveRelation<T>(value: T | string | number): T | null {
  if (typeof value === "object" && value !== null) return value as T;
  return null;
}
