import { inngest } from "./inngest";
import { db } from "@brasa/core/db";
import { posts } from "@brasa/core/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";

/**
 * Publicacao agendada — verifica posts com publishedAt no passado e status draft,
 * e muda pra published automaticamente.
 * Roda a cada 5 minutos.
 */
export const scheduledPublish = inngest.createFunction(
  { id: "scheduled-publish", name: "Publicar posts agendados", triggers: [{ cron: "*/5 * * * *" }] },
  async () => {
    const now = new Date().toISOString();

    const scheduled = await db
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(
        and(
          eq(posts.status, "draft"),
          isNotNull(posts.publishedAt),
          lte(posts.publishedAt, now),
        )
      );

    if (scheduled.length === 0) return { published: 0 };

    for (const post of scheduled) {
      await db
        .update(posts)
        .set({ status: "published", updatedAt: now })
        .where(eq(posts.id, post.id));
    }

    return {
      published: scheduled.length,
      posts: scheduled.map((p) => p.title),
    };
  },
);

/**
 * Sync periodico com Supabase — dispara a cada 6 horas.
 * Chama o endpoint interno de sync.
 */
export const scheduledSync = inngest.createFunction(
  { id: "scheduled-supabase-sync", name: "Sync Supabase periodico", triggers: [{ cron: "0 */6 * * *" }] },
  async () => {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) return { skipped: true, reason: "NEXTAUTH_URL nao configurada" };

    const res = await fetch(`${baseUrl}/api/webhooks/supabase-sync`, {
      method: "POST",
    });

    return { status: res.status, ok: res.ok };
  },
);

export const functions = [scheduledPublish, scheduledSync];
