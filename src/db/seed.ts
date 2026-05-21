import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { users, siteSettings, subscriptions } from "./schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding database...");

  // Hash the default admin password
  const passwordHash = await bcrypt.hash("admin123", 12);

  // Insert admin user
  const [adminUser] = await db
    .insert(users)
    .values({
      name: "Administrador",
      email: "admin@medicinal.com",
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (adminUser) {
    console.log(`Admin user created: ${adminUser.email}`);
  } else {
    console.log("Admin user already exists, skipped.");
  }

  // Insert default site settings
  const [settings] = await db
    .insert(siteSettings)
    .values({
      siteName: "Medicinal na Web",
      siteDescription:
        "Blog sobre plantas medicinais, suplementos, receitas naturais e bem-estar.",
      footerText:
        "Medicinal na Web - Seu guia de saude natural e plantas medicinais.",
      copyrightText: `${new Date().getFullYear()} Medicinal na Web. Todos os direitos reservados.`,
      newsletterTitle: "Receba nossas novidades",
      newsletterDescription:
        "Cadastre-se para receber artigos, dicas e receitas diretamente no seu e-mail.",
      newsletterConsent:
        "Ao se inscrever, voce concorda em receber nossos e-mails. Pode cancelar a qualquer momento.",
      seoTitle: "Medicinal na Web - Plantas Medicinais, Suplementos e Bem-estar",
      seoDescription:
        "Descubra o poder das plantas medicinais, suplementos naturais, receitas saudaveis e dicas de bem-estar no Medicinal na Web.",
      seoKeywords:
        "plantas medicinais, suplementos naturais, receitas saudaveis, bem-estar, saude natural, fitoterapia",
    })
    .returning();

  if (settings) {
    console.log(`Site settings created (id: ${settings.id})`);
  }

  // Insert default subscription
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + 30);

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      tenantId: 1,
      status: "active",
      nextDueDate: nextDueDate.toISOString(),
      graceDays: 7,
    })
    .onConflictDoNothing({ target: subscriptions.tenantId })
    .returning();

  if (subscription) {
    console.log(`Subscription created (id: ${subscription.id})`);
  } else {
    console.log("Subscription already exists, skipped.");
  }

  console.log("Seed completed successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
