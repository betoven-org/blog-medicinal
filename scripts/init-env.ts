/**
 * Brasa CMS — Init .env.local
 *
 * Cria .env.local a partir do .env.example com secrets gerados automaticamente.
 * Nao sobrescreve se ja existir (use --force pra forcar).
 *
 * Uso: pnpm init:env [--force]
 */

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

const root = path.resolve(import.meta.dirname, "..");
const examplePath = path.join(root, ".env.example");
const outputPath = path.join(root, ".env.local");
const force = process.argv.includes("--force");

if (fs.existsSync(outputPath) && !force) {
  console.log(`\n${YELLOW}.env.local ja existe. Use --force pra sobrescrever.${RESET}\n`);
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.error(`${RED}.env.example nao encontrado.${RESET}`);
  process.exit(1);
}

const autoSecrets: Record<string, () => string> = {
  AUTH_SECRET: () => crypto.randomBytes(32).toString("hex"),
  NEXTAUTH_SECRET: () => crypto.randomBytes(32).toString("hex"),
  METRICS_INGEST_SECRET: () => crypto.randomBytes(16).toString("hex"),
  REVALIDATE_SECRET: () => crypto.randomBytes(16).toString("hex"),
  SUPABASE_WEBHOOK_SECRET: () => crypto.randomBytes(16).toString("hex"),
  CRON_SECRET: () => crypto.randomBytes(16).toString("hex"),
};

let content = fs.readFileSync(examplePath, "utf-8");
const generated: string[] = [];

for (const [key, gen] of Object.entries(autoSecrets)) {
  // Match both KEY="" and # KEY=""
  const regex = new RegExp(`^(#\\s*)?${key}=""`, "m");
  if (regex.test(content)) {
    const value = gen();
    // Uncomment if commented and fill value
    content = content.replace(regex, `${key}="${value}"`);
    generated.push(key);
  }
}

fs.writeFileSync(outputPath, content, "utf-8");

console.log("");
console.log(`${CYAN}${BOLD}  Brasa CMS${RESET} ${DIM}— .env.local criado${RESET}`);
console.log("");

if (generated.length > 0) {
  console.log(`${GREEN}  Secrets gerados automaticamente:${RESET}`);
  for (const key of generated) {
    console.log(`  ${DIM}-${RESET} ${key}`);
  }
  console.log("");
}

console.log(`${YELLOW}  Preencha manualmente:${RESET}`);
console.log(`  ${DIM}-${RESET} DATABASE_URI`);
console.log(`  ${DIM}-${RESET} BRASA_TENANT_SLUG`);
console.log(`  ${DIM}-${RESET} SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ${DIM}(se usar midia)${RESET}`);
console.log(`  ${DIM}-${RESET} VERCEL_TOKEN + VERCEL_PROJECT_ID ${DIM}(se usar admin dominios)${RESET}`);
console.log(`  ${DIM}-${RESET} STRIPE_* ${DIM}(se usar assinaturas)${RESET}`);
console.log("");
