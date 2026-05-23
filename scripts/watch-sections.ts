/**
 * Brasa CMS — Section Watcher
 *
 * Observa mudancas em src/components/sections/ e regenera manifest.json.
 * Roda em paralelo com o dev server para sync automatico.
 *
 * Mostra output colorido no terminal para diferenciar do Next.js.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const SECTIONS_DIR = path.resolve(__dirname, "../src/components/sections");
const MANIFEST_PATH = path.resolve(__dirname, "../src/manifest.json");
const EXTRACT_SCRIPT = path.resolve(__dirname, "extract-sections.ts");

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function log(msg: string) {
  const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  console.log(`${DIM}${time}${RESET} ${CYAN}[brasa]${RESET} ${msg}`);
}

function regenerate(reason: string) {
  log(`${YELLOW}${reason}${RESET} — regenerando manifest...`);
  try {
    const start = Date.now();
    execSync(`npx tsx ${EXTRACT_SCRIPT}`, {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
    });
    const elapsed = Date.now() - start;

    // Count sections in manifest
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
      const count = manifest.sections?.length || 0;
      log(`${GREEN}${BOLD}manifest.json${RESET}${GREEN} atualizado${RESET} ${DIM}(${count} sections, ${elapsed}ms)${RESET}`);
    } catch {
      log(`${GREEN}manifest.json atualizado${RESET} ${DIM}(${elapsed}ms)${RESET}`);
    }
  } catch (err: any) {
    console.error(`${CYAN}[brasa]${RESET} \x1b[31mErro ao gerar manifest:\x1b[0m`, err.stderr?.toString() || err.message);
  }
}

function main() {
  // Ensure sections dir exists
  if (!fs.existsSync(SECTIONS_DIR)) {
    fs.mkdirSync(SECTIONS_DIR, { recursive: true });
  }

  // Initial generation
  console.log("");
  console.log(`${CYAN}${BOLD}  Brasa CMS${RESET} ${DIM}— Section Watcher${RESET}`);
  console.log(`${DIM}  Observando: src/components/sections/${RESET}`);
  console.log("");

  regenerate("Inicializacao");

  // Watch with debounce
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  fs.watch(SECTIONS_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".tsx")) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      regenerate(`${filename} ${eventType === "rename" ? "adicionado/removido" : "modificado"}`);
    }, 300);
  });

  // Keep process alive
  process.on("SIGINT", () => {
    log("Watcher encerrado");
    process.exit(0);
  });

  log(`${DIM}Aguardando mudancas...${RESET}`);
}

main();
