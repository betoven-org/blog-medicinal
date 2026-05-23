import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@brasa/core/db";
import { tenants } from "@brasa/core/schema";
import { eq, and, SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export const TENANT_HEADER = "x-tenant-id";

export type Tenant = {
  id: number;
  slug: string;
  name: string;
  domain: string | null;
  subdomain: string | null;
  logoUrl: string | null;
  plan: string;
  active: boolean;
};

/**
 * Get current tenant ID from request headers.
 * Set by middleware via x-tenant-id header.
 */
export const getTenantId = cache(async (): Promise<number> => {
  const h = await headers();
  const id = h.get(TENANT_HEADER);
  return id ? parseInt(id, 10) : 1;
});

/**
 * Get full tenant object.
 */
export const getTenant = cache(async (): Promise<Tenant | null> => {
  const id = await getTenantId();
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1);
  return tenant || null;
});

/**
 * Creates a tenant filter SQL condition.
 * Usage: tenantFilter(posts.tenantId)
 */
export async function tenantFilter(column: PgColumn): Promise<SQL> {
  const id = await getTenantId();
  return eq(column, id);
}

/**
 * Combines tenant filter with additional conditions.
 * Usage: const where = await tenantAnd(posts.tenantId, eq(posts.status, "published"))
 */
export async function tenantAnd(column: PgColumn, ...conditions: (SQL | undefined)[]): Promise<SQL> {
  const id = await getTenantId();
  const filtered = conditions.filter(Boolean) as SQL[];
  return and(eq(column, id), ...filtered)!;
}
