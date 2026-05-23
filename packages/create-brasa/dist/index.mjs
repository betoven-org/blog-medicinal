#!/usr/bin/env node

// src/index.ts
import prompts from "prompts";
import kleur from "kleur";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import bcryptjs from "bcryptjs";
var TEMPLATE_REPO = "betoven-org/blog-medicinal";
function log(msg) {
  console.log(`  ${msg}`);
}
function step(n, total, msg) {
  console.log(`
${kleur.cyan(`[${n}/${total}]`)} ${msg}`);
}
function run(cmd, cwd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd, stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}
function runVisible(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
}
async function main() {
  console.log("");
  console.log(kleur.cyan().bold("  Brasa CMS") + kleur.dim(" \u2014 Criar novo projeto"));
  console.log("");
  const argName = process.argv[2];
  const response = await prompts([
    {
      type: argName ? null : "text",
      name: "projectName",
      message: "Nome do diretorio do projeto",
      initial: "meu-blog",
      validate: (v) => v.length > 0 || "Obrigatorio"
    },
    {
      type: "text",
      name: "siteName",
      message: "Nome do site",
      validate: (v) => v.length > 0 || "Obrigatorio"
    },
    {
      type: "text",
      name: "slug",
      message: "Slug do tenant (ex: farmacia-x)",
      validate: (v) => /^[a-z0-9-]+$/.test(v) || "Apenas letras minusculas, numeros e hifens"
    },
    {
      type: "text",
      name: "domain",
      message: "Dominio de producao (deixe vazio pra depois)"
    },
    {
      type: "text",
      name: "adminName",
      message: "Nome do admin",
      initial: "Admin"
    },
    {
      type: "text",
      name: "adminEmail",
      message: "Email do admin",
      validate: (v) => v.includes("@") || "Email invalido"
    },
    {
      type: "password",
      name: "adminPassword",
      message: "Senha do admin",
      validate: (v) => v.length >= 6 || "Minimo 6 caracteres"
    },
    {
      type: "text",
      name: "whatsapp",
      message: "WhatsApp (ex: 5511999999999, vazio pra depois)"
    },
    {
      type: "text",
      name: "databaseUrl",
      message: "DATABASE_URI (PostgreSQL/Neon)",
      validate: (v) => v.startsWith("postgresql://") || "Deve comecar com postgresql://"
    },
    {
      type: "confirm",
      name: "setupVercel",
      message: "Configurar Vercel agora?",
      initial: true
    },
    {
      type: (prev) => prev ? "text" : null,
      name: "vercelTeam",
      message: "Vercel team/scope (vazio pra pessoal)"
    }
  ], {
    onCancel: () => {
      console.log("\nCancelado.");
      process.exit(0);
    }
  });
  const projectName = argName || response.projectName;
  const projectDir = path.resolve(process.cwd(), projectName);
  const totalSteps = response.setupVercel ? 6 : 4;
  step(1, totalSteps, "Clonando template...");
  if (fs.existsSync(projectDir)) {
    console.error(kleur.red(`  Diretorio "${projectName}" ja existe.`));
    process.exit(1);
  }
  try {
    const degit = (await import("degit")).default;
    const emitter = degit(TEMPLATE_REPO, { cache: false, force: true });
    await emitter.clone(projectDir);
    log(kleur.green(`Template clonado em ${projectName}/`));
  } catch {
    run(`git clone --depth 1 https://github.com/${TEMPLATE_REPO}.git ${projectName}`);
    fs.rmSync(path.join(projectDir, ".git"), { recursive: true, force: true });
    log(kleur.green(`Template clonado em ${projectName}/`));
  }
  run("git init", projectDir);
  log(kleur.dim("Git inicializado"));
  step(2, totalSteps, "Configurando ambiente...");
  const nextAuthSecret = crypto.randomBytes(32).toString("hex");
  const metricsSecret = crypto.randomBytes(16).toString("hex");
  const siteUrl = response.domain ? `https://${response.domain}` : `https://${response.slug}.vercel.app`;
  const envContent = `# Brasa CMS \u2014 ${response.siteName}
# Gerado automaticamente por create-brasa

DATABASE_URI="${response.databaseUrl}"

NEXTAUTH_SECRET="${nextAuthSecret}"
NEXTAUTH_URL="${siteUrl}"

NEXT_PUBLIC_SITE_URL="${siteUrl}"

METRICS_INGEST_SECRET="${metricsSecret}"

BRASA_TENANT_SLUG="${response.slug}"
`;
  fs.writeFileSync(path.join(projectDir, ".env.local"), envContent);
  log(kleur.green(".env.local criado"));
  step(3, totalSteps, "Instalando dependencias...");
  runVisible("pnpm install", projectDir);
  log(kleur.green("Dependencias instaladas"));
  step(4, totalSteps, "Criando tenant no banco...");
  const sql = neon(response.databaseUrl);
  try {
    const passwordHash = await bcryptjs.hash(response.adminPassword, 12);
    const [tenant] = await sql`
      INSERT INTO tenants (slug, name, domain, subdomain)
      VALUES (${response.slug}, ${response.siteName}, ${response.domain || null}, ${response.slug})
      RETURNING id
    `;
    const tenantId = tenant.id;
    await sql`
      INSERT INTO users (tenant_id, name, email, password_hash, role)
      VALUES (${tenantId}, ${response.adminName}, ${response.adminEmail}, ${passwordHash}, 'admin')
    `;
    await sql`
      INSERT INTO site_settings (tenant_id, site_name, whatsapp)
      VALUES (${tenantId}, ${response.siteName}, ${response.whatsapp || null})
    `;
    const defaultSections = JSON.stringify([
      { id: "hero-1", component: "HeroPost", props: { mode: "featured", showCategory: true, showAuthor: true, showReadingTime: true, sideCount: "4" } },
      { id: "categories", component: "CategoryBar", props: { showAll: true, limit: 10 } },
      { id: "grid-sidebar", component: "PostGridWithSidebar", props: { gridTitle: "Mais Recentes", gridMode: "recent", gridLimit: 4, gridColumns: "2", gridShowCategory: true, gridViewAllHref: "/blog", sidebarTitle: "Tendencias", sidebarMode: "trending", sidebarLimit: 5 } }
    ]);
    await sql`
      INSERT INTO pages (tenant_id, slug, title, sections) VALUES
      (${tenantId}, 'home', 'Home', ${defaultSections}::jsonb),
      (${tenantId}, 'politica-de-privacidade', 'Politica de Privacidade', null),
      (${tenantId}, 'blog', 'Blog', null)
    `;
    const nextDue = new Date(Date.now() + 30 * 864e5).toISOString();
    await sql`
      INSERT INTO subscriptions (tenant_id, status, next_due_date)
      VALUES (${tenantId}, 'active', ${nextDue})
    `;
    const guideCount = await sql`
      INSERT INTO cms_guides (tenant_id, slug, title, sort_order, content)
      SELECT ${tenantId}, slug, title, sort_order, content
      FROM cms_guides WHERE tenant_id = 1
      RETURNING id
    `;
    log(kleur.green(`Tenant "${response.siteName}" criado (id: ${tenantId})`));
    log(kleur.dim(`Admin: ${response.adminEmail}`));
    log(kleur.dim(`${guideCount.length} guias copiados`));
  } catch (err) {
    if (err.message?.includes("duplicate key")) {
      console.error(kleur.red(`
  Slug "${response.slug}" ja existe no banco. Use outro slug.`));
      process.exit(1);
    }
    throw err;
  }
  if (response.setupVercel) {
    step(5, totalSteps, "Configurando Vercel...");
    const scopeFlag = response.vercelTeam ? `--scope ${response.vercelTeam}` : "";
    run("git add -A", projectDir);
    run('git commit -m "feat: init brasa cms"', projectDir);
    try {
      runVisible(`gh repo create ${response.slug} --private --source . --push`, projectDir);
      log(kleur.green(`Repo ${response.slug} criado no GitHub`));
    } catch {
      log(kleur.yellow("Nao foi possivel criar repo no GitHub. Crie manualmente."));
    }
    try {
      run(`vercel link --yes --project ${response.slug} ${scopeFlag}`, projectDir);
      log(kleur.green(`Projeto vinculado na Vercel`));
      const envVars = {
        DATABASE_URI: response.databaseUrl,
        NEXTAUTH_SECRET: nextAuthSecret,
        NEXTAUTH_URL: siteUrl,
        NEXT_PUBLIC_SITE_URL: siteUrl,
        METRICS_INGEST_SECRET: metricsSecret,
        BRASA_TENANT_SLUG: response.slug
      };
      for (const [key, value] of Object.entries(envVars)) {
        try {
          execSync(`echo "${value}" | vercel env add ${key} production ${scopeFlag} --force`, {
            cwd: projectDir,
            stdio: "pipe"
          });
        } catch {
        }
      }
      log(kleur.green(`${Object.keys(envVars).length} env vars configuradas`));
    } catch {
      log(kleur.yellow("Nao foi possivel configurar Vercel. Configure manualmente."));
    }
    step(6, totalSteps, "Fazendo deploy...");
    try {
      const deployUrl = run(`vercel deploy --prod ${scopeFlag}`, projectDir);
      if (deployUrl) {
        log(kleur.green(`Deploy: ${deployUrl}`));
      }
    } catch {
      log(kleur.yellow("Deploy falhou. Rode 'vercel deploy --prod' manualmente."));
    }
  } else {
    run("git add -A", projectDir);
    run('git commit -m "feat: init brasa cms"', projectDir);
  }
  console.log("");
  console.log(kleur.green().bold("  Projeto criado com sucesso!"));
  console.log("");
  console.log(`  ${kleur.dim("Para comecar:")}

  ${kleur.cyan(`cd ${projectName}`)}
  ${kleur.cyan("pnpm dev")}

  ${kleur.dim("Admin:")} ${response.adminEmail}
  ${kleur.dim("URL:")}   ${siteUrl}
  ${kleur.dim("Login:")} /admin/login
`);
}
main().catch((err) => {
  console.error(kleur.red(`
Erro: ${err.message || err}`));
  process.exit(1);
});
