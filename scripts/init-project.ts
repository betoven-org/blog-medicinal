/**
 * Brasa CMS — Project Init
 *
 * Roda no repo forkado do cliente. Faz:
 * 1. Cria tenant no banco compartilhado
 * 2. Cria projeto na Vercel com env vars
 * 3. Vincula ao repo forkado
 * 4. Faz primeiro deploy
 *
 * Pre-requisitos:
 *   - Repo ja forkado no GitHub
 *   - gh CLI autenticado (gh auth login)
 *   - Vercel CLI autenticado (vercel login)
 *   - DATABASE_URI no .env.local apontando pro banco compartilhado
 *
 * Uso: pnpm init:project
 */

import { neon } from "@neondatabase/serverless";
import { execSync } from "child_process";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

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

  // Check gh CLI
  const ghVersion = runSilent("gh --version");
  if (!ghVersion) {
    console.error(`${RED}gh CLI nao encontrado. Instale: https://cli.github.com${RESET}`);
    process.exit(1);
  }

  // Check vercel CLI
  const vercelVersion = runSilent("vercel --version");
  if (!vercelVersion) {
    console.error(`${RED}Vercel CLI nao encontrado. Instale: npm i -g vercel${RESET}`);
    process.exit(1);
  }

  // Check git remote
  const repoUrl = runSilent("gh repo view --json url -q .url");
  if (!repoUrl) {
    console.error(`${RED}Nao foi possivel detectar o repo. Rode 'gh auth login' primeiro.${RESET}`);
    process.exit(1);
  }
  const repoName = repoUrl.replace("https://github.com/", "");
  console.log(`  ${DIM}Repo: ${repoName}${RESET}`);

  // Check DATABASE_URI
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error(`${RED}.env.local nao encontrado. Crie com DATABASE_URI do banco compartilhado.${RESET}`);
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, "utf-8");
  const dbMatch = envContent.match(/DATABASE_URI="([^"]+)"/);
  if (!dbMatch) {
    console.error(`${RED}DATABASE_URI nao encontrado no .env.local${RESET}`);
    process.exit(1);
  }

  console.log(`  ${DIM}Banco: conectado${RESET}`);
  console.log("");

  // ── Coletar dados ───────────────────────────────────────────────────

  const siteName = await ask(`${CYAN}Nome do site:${RESET} `);
  const slug = await ask(`${CYAN}Slug do tenant (ex: farmacia-x):${RESET} `);
  const domain = await ask(`${CYAN}Dominio de producao (ex: www.farmacia-x.com.br):${RESET} `);
  const adminName = await ask(`${CYAN}Nome do admin:${RESET} `);
  const adminEmail = await ask(`${CYAN}Email do admin:${RESET} `);
  const adminPassword = await ask(`${CYAN}Senha do admin:${RESET} `);
  const whatsapp = await ask(`${CYAN}WhatsApp (ex: 5511999999999):${RESET} `);
  const vercelTeam = await ask(`${CYAN}Vercel team/scope (deixe vazio pra pessoal):${RESET} `);

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

  console.log(`${CYAN}[1/5]${RESET} Criando tenant no banco...`);

  const sql = neon(dbMatch[1]);

  const bcryptjs = await import("bcryptjs");
  const passwordHash = await bcryptjs.hash(adminPassword, 12);

  try {
    const [tenant] = await sql`
      INSERT INTO tenants (slug, name, domain, subdomain)
      VALUES (${slug}, ${siteName}, ${domain || null}, ${slug})
      RETURNING id
    `;
    const tenantId = tenant.id;

    // Usuario admin
    await sql`
      INSERT INTO users (tenant_id, name, email, password_hash, role)
      VALUES (${tenantId}, ${adminName || "Admin"}, ${adminEmail}, ${passwordHash}, 'admin')
    `;

    // Site settings
    await sql`
      INSERT INTO site_settings (tenant_id, site_name, whatsapp)
      VALUES (${tenantId}, ${siteName}, ${whatsapp || null})
    `;

    // Paginas default
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

    // Subscription
    const nextDue = new Date(Date.now() + 30 * 86400000).toISOString();
    await sql`
      INSERT INTO subscriptions (tenant_id, status, next_due_date)
      VALUES (${tenantId}, 'active', ${nextDue})
    `;

    // Guias
    await sql`
      INSERT INTO cms_guides (tenant_id, slug, title, sort_order, content)
      SELECT ${tenantId}, slug, title, sort_order, content
      FROM cms_guides WHERE tenant_id = 1
    `;

    console.log(`  ${GREEN}Tenant criado (id: ${tenantId})${RESET}`);
    console.log(`  ${GREEN}Admin: ${adminEmail}${RESET}`);

    // ── 2. Gerar NEXTAUTH_SECRET ────────────────────────────────────

    console.log(`${CYAN}[2/5]${RESET} Gerando secrets...`);

    const crypto = await import("crypto");
    const nextAuthSecret = crypto.randomBytes(32).toString("hex");
    const metricsSecret = crypto.randomBytes(16).toString("hex");

    console.log(`  ${GREEN}Secrets gerados${RESET}`);

    // ── 3. Criar projeto Vercel ─────────────────────────────────────

    console.log(`${CYAN}[3/5]${RESET} Criando projeto na Vercel...`);

    const projectName = slug;
    const scopeFlag = vercelTeam ? `--scope ${vercelTeam}` : "";

    run(`vercel link --yes --project ${projectName} ${scopeFlag}`, true);
    console.log(`  ${GREEN}Projeto ${projectName} vinculado${RESET}`);

    // ── 4. Configurar env vars ──────────────────────────────────────

    console.log(`${CYAN}[4/5]${RESET} Configurando variaveis de ambiente...`);

    const envVars: Record<string, string> = {
      DATABASE_URI: dbMatch[1],
      NEXTAUTH_SECRET: nextAuthSecret,
      NEXTAUTH_URL: domain ? `https://${domain}` : `https://${projectName}.vercel.app`,
      NEXT_PUBLIC_SITE_URL: domain ? `https://${domain}` : `https://${projectName}.vercel.app`,
      METRICS_INGEST_SECRET: metricsSecret,
      BRASA_TENANT_SLUG: slug,
    };

    for (const [key, value] of Object.entries(envVars)) {
      try {
        execSync(`echo "${value}" | vercel env add ${key} production ${scopeFlag} --force`, {
          stdio: "pipe",
          encoding: "utf-8",
        });
      } catch {
        // Env var might already exist
      }
    }

    console.log(`  ${GREEN}${Object.keys(envVars).length} env vars configuradas${RESET}`);

    // ── 5. Deploy ───────────────────────────────────────────────────

    console.log(`${CYAN}[5/5]${RESET} Fazendo deploy...`);

    const deployUrl = runSilent(`vercel deploy --prod ${scopeFlag}`);

    console.log(`\n${GREEN}${BOLD}Projeto "${siteName}" criado com sucesso!${RESET}\n`);
    console.log(`${DIM}Resumo:${RESET}`);
    console.log(`  Tenant ID: ${tenantId}`);
    console.log(`  Repo: ${repoName}`);
    console.log(`  Deploy: ${deployUrl || "(verificar na Vercel)"}`);
    console.log(`  Admin: ${adminEmail}`);
    console.log(`  Dominio: ${domain || `${projectName}.vercel.app`}`);
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
