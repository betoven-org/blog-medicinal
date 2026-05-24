/**
 * Brasa CMS — Project Init
 *
 * Roda no repo forkado do cliente. Faz tudo em um comando:
 * 1. Pergunta DATABASE_URI e dados do tenant
 * 2. Cria tenant no banco compartilhado
 * 3. Gera secrets e escreve .env.local completo
 * 4. Cria projeto na Vercel com env vars
 * 5. Faz primeiro deploy
 *
 * Pre-requisitos:
 *   - Repo ja forkado no GitHub
 *   - gh CLI autenticado (gh auth login)
 *   - Vercel CLI autenticado (vercel login)
 *
 * Uso: pnpm init:project
 */

import { neon } from "@neondatabase/serverless";
import { execSync } from "child_process";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise((r) => rl.question(q, r));

function run(cmd: string, silent = false): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: silent ? "pipe" : "inherit" }).trim();
  } catch (err: any) {
    if (!silent) console.error(`${RED}Erro ao executar: ${cmd}${RESET}`);
    return "";
  }
}

function runSilent(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}

async function main() {
  console.log("");
  console.log(`${CYAN}${BOLD}  Brasa CMS${RESET} ${DIM}— Inicializar Projeto${RESET}`);
  console.log("");

  // ── Pre-checks ──────────────────────────────────────────────────────

  const ghVersion = runSilent("gh --version");
  if (!ghVersion) {
    console.error(`${RED}gh CLI nao encontrado. Instale: https://cli.github.com${RESET}`);
    process.exit(1);
  }

  const vercelVersion = runSilent("vercel --version");
  if (!vercelVersion) {
    console.error(`${RED}Vercel CLI nao encontrado. Instale: npm i -g vercel${RESET}`);
    process.exit(1);
  }

  const repoUrl = runSilent("gh repo view --json url -q .url");
  if (!repoUrl) {
    console.error(`${RED}Nao foi possivel detectar o repo. Rode 'gh auth login' primeiro.${RESET}`);
    process.exit(1);
  }
  const repoName = repoUrl.replace("https://github.com/", "");
  console.log(`  ${DIM}Repo: ${repoName}${RESET}`);
  console.log("");

  // ── Coletar dados ───────────────────────────────────────────────────

  const databaseUri = await ask(`${CYAN}DATABASE_URI (Neon PostgreSQL):${RESET} `);
  if (!databaseUri) {
    console.error(`\n${RED}DATABASE_URI e obrigatorio.${RESET}`);
    process.exit(1);
  }

  // Testar conexao
  try {
    const testSql = neon(databaseUri);
    await testSql`SELECT 1`;
    console.log(`  ${GREEN}Banco: conectado${RESET}\n`);
  } catch {
    console.error(`\n${RED}Nao foi possivel conectar ao banco. Verifique a URI.${RESET}`);
    process.exit(1);
  }

  const siteName = await ask(`${CYAN}Nome do site:${RESET} `);
  const slug = await ask(`${CYAN}Slug do tenant (ex: farmacia-x):${RESET} `);
  const domain = await ask(`${CYAN}Dominio de producao (ex: www.farmacia-x.com.br):${RESET} `);
  const adminName = await ask(`${CYAN}Nome do admin:${RESET} `);
  const adminEmail = await ask(`${CYAN}Email do admin:${RESET} `);
  const adminPassword = await ask(`${CYAN}Senha do admin:${RESET} `);
  const whatsapp = await ask(`${CYAN}WhatsApp (ex: 5511999999999):${RESET} `);
  const vercelTeam = await ask(`${CYAN}Vercel team/scope (deixe vazio pra pessoal):${RESET} `);

  console.log("");
  console.log(`${DIM}  Opcionais (deixe vazio pra pular):${RESET}`);
  const supabaseUrl = await ask(`${CYAN}SUPABASE_URL:${RESET} `);
  const supabaseKey = await ask(`${CYAN}SUPABASE_SERVICE_ROLE_KEY:${RESET} `);
  const stripeSecret = await ask(`${CYAN}STRIPE_SECRET_KEY:${RESET} `);
  const stripeWebhook = await ask(`${CYAN}STRIPE_WEBHOOK_SECRET:${RESET} `);
  const stripePub = await ask(`${CYAN}NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:${RESET} `);

  if (!siteName || !slug || !adminEmail || !adminPassword) {
    console.error(`\n${RED}Nome, slug, email e senha sao obrigatorios.${RESET}`);
    process.exit(1);
  }

  const confirm = await ask(`\n${YELLOW}Criar projeto "${siteName}" (${slug})? (s/n):${RESET} `);
  if (confirm.toLowerCase() !== "s") {
    console.log("Cancelado.");
    process.exit(0);
  }

  console.log("");

  // ── 1. Criar tenant no banco ────────────────────────────────────────

  console.log(`${CYAN}[1/6]${RESET} Criando tenant no banco...`);

  const sql = neon(databaseUri);

  const bcryptjs = await import("bcryptjs");
  const passwordHash = await bcryptjs.hash(adminPassword, 12);

  try {
    const [tenant] = await sql`
      INSERT INTO tenants (slug, name, domain, subdomain)
      VALUES (${slug}, ${siteName}, ${domain || null}, ${slug})
      RETURNING id
    `;
    const tenantId = tenant.id;

    await sql`
      INSERT INTO users (tenant_id, name, email, password_hash, role)
      VALUES (${tenantId}, ${adminName || "Admin"}, ${adminEmail}, ${passwordHash}, 'admin')
    `;

    await sql`
      INSERT INTO site_settings (tenant_id, site_name, whatsapp)
      VALUES (${tenantId}, ${siteName}, ${whatsapp || null})
    `;

    const defaultSections = JSON.stringify([
      { id: "hero-1", component: "HeroPost", props: { mode: "featured", showCategory: true, showAuthor: true, showReadingTime: true, sideCount: "4" } },
      { id: "categories", component: "CategoryBar", props: { showAll: true, limit: 10 } },
      { id: "grid-sidebar", component: "PostGridWithSidebar", props: { gridTitle: "Mais Recentes", gridMode: "recent", gridLimit: 4, gridColumns: "2", gridShowCategory: true, gridViewAllHref: "/blog", sidebarTitle: "Tendencias", sidebarMode: "trending", sidebarLimit: 5 } },
    ]);

    await sql`
      INSERT INTO pages (tenant_id, slug, title, sections) VALUES
      (${tenantId}, 'home', 'Home', ${defaultSections}::jsonb),
      (${tenantId}, 'politica-de-privacidade', 'Politica de Privacidade', null),
      (${tenantId}, 'blog', 'Blog', null)
    `;

    const nextDue = new Date(Date.now() + 30 * 86400000).toISOString();
    await sql`
      INSERT INTO subscriptions (tenant_id, status, next_due_date)
      VALUES (${tenantId}, 'active', ${nextDue})
    `;

    await sql`
      INSERT INTO cms_guides (tenant_id, slug, title, sort_order, content)
      SELECT ${tenantId}, slug, title, sort_order, content
      FROM cms_guides WHERE tenant_id = 1
    `;

    console.log(`  ${GREEN}Tenant criado (id: ${tenantId})${RESET}`);
    console.log(`  ${GREEN}Admin: ${adminEmail}${RESET}`);

    // ── 2. Gerar secrets ──────────────────────────────────────────────

    console.log(`${CYAN}[2/6]${RESET} Gerando secrets...`);

    const authSecret = crypto.randomBytes(32).toString("hex");
    const nextAuthSecret = crypto.randomBytes(32).toString("hex");
    const metricsSecret = crypto.randomBytes(16).toString("hex");
    const revalidateSecret = crypto.randomBytes(16).toString("hex");
    const supabaseWebhookSecret = crypto.randomBytes(16).toString("hex");
    const cronSecret = crypto.randomBytes(16).toString("hex");

    console.log(`  ${GREEN}6 secrets gerados${RESET}`);

    // ── 3. Escrever .env.local ────────────────────────────────────────

    console.log(`${CYAN}[3/6]${RESET} Escrevendo .env.local...`);

    const siteUrl = domain ? `https://${domain}` : `https://${slug}.vercel.app`;

    const envLines = [
      `# Brasa CMS — .env.local`,
      `# Gerado por: pnpm init:project`,
      `# Projeto: ${siteName} (${slug})`,
      ``,
      `# Banco de dados (Neon PostgreSQL)`,
      `DATABASE_URI="${databaseUri}"`,
      ``,
      `# NextAuth`,
      `AUTH_SECRET="${authSecret}"`,
      `NEXTAUTH_SECRET="${nextAuthSecret}"`,
      `NEXTAUTH_URL="${siteUrl}"`,
      ``,
      `# URL publica do site`,
      `NEXT_PUBLIC_SITE_URL="${siteUrl}"`,
      ``,
      `# Tenant`,
      `BRASA_TENANT_SLUG="${slug}"`,
      ``,
      `# Metricas`,
      `METRICS_INGEST_SECRET="${metricsSecret}"`,
      ``,
      `# Revalidacao de cache`,
      `REVALIDATE_SECRET="${revalidateSecret}"`,
      ``,
      `# Cron jobs`,
      `CRON_SECRET="${cronSecret}"`,
      ``,
      `# Supabase (sync de midia)`,
      supabaseUrl ? `SUPABASE_URL="${supabaseUrl}"` : `# SUPABASE_URL=""`,
      supabaseKey ? `SUPABASE_SERVICE_ROLE_KEY="${supabaseKey}"` : `# SUPABASE_SERVICE_ROLE_KEY=""`,
      `SUPABASE_WEBHOOK_SECRET="${supabaseWebhookSecret}"`,
      ``,
      `# Stripe (assinaturas)`,
      stripeSecret ? `STRIPE_SECRET_KEY="${stripeSecret}"` : `# STRIPE_SECRET_KEY=""`,
      stripeWebhook ? `STRIPE_WEBHOOK_SECRET="${stripeWebhook}"` : `# STRIPE_WEBHOOK_SECRET=""`,
      stripePub ? `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${stripePub}"` : `# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""`,
      ``,
      `# Vercel (admin: dominios e env vars)`,
      `# VERCEL_TOKEN=""`,
      `# VERCEL_PROJECT_ID=""`,
      ``,
      `# Analytics (dashboard admin)`,
      `# ANALYTICS_TOKEN=""`,
      `# ANALYTICS_PROJECT_ID=""`,
      `# ANALYTICS_TEAM_ID=""`,
      ``,
    ];

    const envPath = path.resolve(process.cwd(), ".env.local");
    fs.writeFileSync(envPath, envLines.join("\n"), "utf-8");

    console.log(`  ${GREEN}.env.local criado com todas as variaveis${RESET}`);

    // ── 4. Criar projeto Vercel ───────────────────────────────────────

    console.log(`${CYAN}[4/6]${RESET} Criando projeto na Vercel...`);

    const projectName = slug;
    const scopeFlag = vercelTeam ? `--scope ${vercelTeam}` : "";

    run(`vercel link --yes --project ${projectName} ${scopeFlag}`, true);
    console.log(`  ${GREEN}Projeto ${projectName} vinculado${RESET}`);

    // ── 5. Configurar env vars na Vercel ──────────────────────────────

    console.log(`${CYAN}[5/6]${RESET} Configurando variaveis de ambiente na Vercel...`);

    const vercelEnvVars: Record<string, string> = {
      DATABASE_URI: databaseUri,
      AUTH_SECRET: authSecret,
      NEXTAUTH_SECRET: nextAuthSecret,
      NEXTAUTH_URL: siteUrl,
      NEXT_PUBLIC_SITE_URL: siteUrl,
      METRICS_INGEST_SECRET: metricsSecret,
      REVALIDATE_SECRET: revalidateSecret,
      CRON_SECRET: cronSecret,
      BRASA_TENANT_SLUG: slug,
      SUPABASE_WEBHOOK_SECRET: supabaseWebhookSecret,
    };

    if (supabaseUrl) vercelEnvVars.SUPABASE_URL = supabaseUrl;
    if (supabaseKey) vercelEnvVars.SUPABASE_SERVICE_ROLE_KEY = supabaseKey;
    if (stripeSecret) vercelEnvVars.STRIPE_SECRET_KEY = stripeSecret;
    if (stripeWebhook) vercelEnvVars.STRIPE_WEBHOOK_SECRET = stripeWebhook;
    if (stripePub) vercelEnvVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripePub;

    for (const [key, value] of Object.entries(vercelEnvVars)) {
      try {
        execSync(`echo "${value}" | vercel env add ${key} production ${scopeFlag} --force`, {
          stdio: "pipe",
          encoding: "utf-8",
        });
      } catch {
        // Env var might already exist
      }
    }

    console.log(`  ${GREEN}${Object.keys(vercelEnvVars).length} env vars configuradas${RESET}`);

    // ── 6. Deploy ─────────────────────────────────────────────────────

    console.log(`${CYAN}[6/6]${RESET} Fazendo deploy...`);

    const deployUrl = runSilent(`vercel deploy --prod ${scopeFlag}`);

    // ── Resumo ────────────────────────────────────────────────────────

    console.log(`\n${GREEN}${BOLD}Projeto "${siteName}" criado com sucesso!${RESET}\n`);
    console.log(`${DIM}Resumo:${RESET}`);
    console.log(`  Tenant ID: ${tenantId}`);
    console.log(`  Repo: ${repoName}`);
    console.log(`  Deploy: ${deployUrl || "(verificar na Vercel)"}`);
    console.log(`  Admin: ${adminEmail}`);
    console.log(`  Dominio: ${domain || `${projectName}.vercel.app`}`);
    console.log(`  .env.local: criado`);
    console.log("");
    console.log(`${DIM}Proximos passos:${RESET}`);
    if (domain) {
      console.log(`  1. Configurar DNS: ${domain} -> cname.vercel-dns.com`);
    }
    console.log(`  ${domain ? "2" : "1"}. Acessar /admin/login com ${adminEmail}`);
    console.log(`  ${domain ? "3" : "2"}. Criar conteudo (posts, produtos, categorias)`);
    console.log(`  ${domain ? "4" : "3"}. Configurar sections da home pelo editor de paginas\n`);

  } catch (err: any) {
    if (err.message?.includes("duplicate key")) {
      console.error(`\n${RED}Slug "${slug}" ja existe. Use outro slug.${RESET}`);
    } else {
      console.error(`\n${RED}Erro: ${err.message || err}${RESET}`);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
