/**
 * Brasa CMS — Dev Connect
 *
 * Roda antes do dev server:
 * 1. Gera o manifest
 * 2. Envia pro CMS remoto (sync sections)
 * 3. Configura frontend_url do tenant como localhost (pro preview funcionar)
 * 4. Mostra banner com URLs
 *
 * O dev NAO precisa do codigo do CMS — usa o admin remoto.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const MANIFEST_PATH = path.resolve(__dirname, "../src/manifest.json");
const EXTRACT_SCRIPT = path.resolve(__dirname, "extract-sections.ts");

const CMS_URL = process.env.CMS_URL || "https://cms.brasa.tech";
const CMS_API_KEY = process.env.CMS_API_KEY || "";
const DEV_PORT = process.env.PORT || "3001";
const DEV_URL = `http://localhost:${DEV_PORT}`;

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

async function main() {
  console.log("");
  console.log(`${CYAN}${BOLD}  Brasa CMS — Dev Connect${RESET}`);
  console.log(`${DIM}  ─────────────────────────────────────${RESET}`);

  if (!CMS_API_KEY) {
    console.log(`${RED}  ✗ CMS_API_KEY nao configurada no .env${RESET}`);
    console.log(`${DIM}  O dev server vai rodar sem sync com o CMS${RESET}`);
    console.log("");
    return;
  }

  // 1. Gera manifest
  try {
    execSync(`npx tsx ${EXTRACT_SCRIPT}`, { cwd: path.resolve(__dirname, ".."), stdio: "pipe" });
  } catch (err: any) {
    console.log(`${RED}  ✗ Erro ao gerar manifest${RESET}`);
    console.log("");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const sectionCount = manifest.sections?.length || 0;

  // 2. Sync manifest pro CMS
  try {
    const res = await fetch(`${CMS_URL}/api/v1/manifest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": CMS_API_KEY },
      body: JSON.stringify(manifest),
    });

    if (res.ok) {
      console.log(`${GREEN}  ✓ Manifest sincronizado${RESET} ${DIM}(${sectionCount} sections)${RESET}`);
    } else {
      console.log(`${YELLOW}  ⚠ Sync manifest falhou: ${res.status}${RESET}`);
    }
  } catch {
    console.log(`${YELLOW}  ⚠ CMS indisponivel — sync pulado${RESET}`);
  }

  // 3. Configura frontend_url como localhost (pro preview do admin)
  try {
    const res = await fetch(`${CMS_URL}/api/v1/dev-url`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-api-key": CMS_API_KEY },
      body: JSON.stringify({ devUrl: DEV_URL }),
    });

    if (res.ok) {
      console.log(`${GREEN}  ✓ Preview conectado${RESET} ${DIM}(${DEV_URL})${RESET}`);
    }
  } catch {
    // Non-critical
  }

  // 4. Banner
  console.log(`${DIM}  ─────────────────────────────────────${RESET}`);
  console.log(`${GREEN}  ▲ Frontend:${RESET}  ${DEV_URL}`);
  console.log(`${CYAN}  ▲ Admin:${RESET}     ${CMS_URL}/admin`);
  console.log(`${DIM}  ▲ Watcher:   auto-sync sections → CMS${RESET}`);
  console.log(`${DIM}  ─────────────────────────────────────${RESET}`);
  console.log("");
}

main();
