/**
 * Mostra banner com URLs do ambiente dev.
 * Chamado antes de iniciar os servidores.
 */

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

console.log("");
console.log(`${CYAN}${BOLD}  Brasa CMS — Dev Environment${RESET}`);
console.log(`${DIM}  ─────────────────────────────────────${RESET}`);
console.log(`${GREEN}  ▲ Frontend:${RESET}  http://localhost:3001`);
console.log(`${CYAN}  ▲ Admin:${RESET}     http://localhost:3000/admin`);
console.log(`${DIM}  ▲ Watcher:   observando src/components/sections/${RESET}`);
console.log(`${DIM}  ─────────────────────────────────────${RESET}`);
console.log("");
