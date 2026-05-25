/**
 * Brasa CMS — Manifest Sync
 *
 * Envia o manifest.json local para o CMS.
 * Usado no postbuild (deploy) e manualmente via `pnpm sync:cms`.
 *
 * Requer: CMS_URL e CMS_API_KEY nas env vars.
 */

import * as fs from "fs";
import * as path from "path";

const MANIFEST_PATH = path.resolve(__dirname, "../src/manifest.json");
const CMS_URL = process.env.CMS_URL || "https://cms.brasa.tech";
const CMS_API_KEY = process.env.CMS_API_KEY || "";

async function main() {
  if (!CMS_API_KEY) {
    console.log("⚠ CMS_API_KEY nao configurada — sync pulado");
    process.exit(0);
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("✗ manifest.json nao encontrado. Rode `pnpm manifest` primeiro.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  console.log(`→ Enviando manifest (${manifest.sections?.length || 0} sections) para ${CMS_URL}...`);

  const res = await fetch(`${CMS_URL}/api/v1/manifest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CMS_API_KEY,
    },
    body: JSON.stringify(manifest),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`✓ Manifest sincronizado com CMS (${data.sections} sections)`);
  } else {
    const text = await res.text();
    console.error(`✗ Erro ${res.status}: ${text}`);
    process.exit(1);
  }
}

main();
