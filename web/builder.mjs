// =====================================================================
//  Builder — serwer HTTP, który na żądanie uruchamia `astro build`
//  i atomowo podmienia serwowaną wersję strony.
//
//  Endpoint:  POST /rebuild   → buduje i przełącza `current`
//             GET  /health    → 200 gdy istnieje zbudowana wersja
//
//  Docelowo w /rebuild uderza Payload (hook afterChange). Teraz — przycisk
//  testowy na stronie. Stara wersja działa przez CAŁY czas budowania;
//  przełączenie to atomowe przepięcie symlinka (zero przerwy).
// =====================================================================
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm, symlink, rename, readdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const execFileP = promisify(execFile);

const WWW = '/srv/www';
const RELEASES = `${WWW}/releases`;
const CURRENT = `${WWW}/current`;
const OUT = '/tmp/astro-dist';  // wynik builda wewnątrz kontenera (szybki fs)
const KEEP = 3;                 // ile ostatnich wersji trzymać (do rollbacku)

let building = false;
let counter = 0;

async function cleanup() {
  const dirs = (await readdir(RELEASES)).filter((n) => n.startsWith('build-')).sort();
  for (const d of dirs.slice(0, -KEEP)) {
    await rm(`${RELEASES}/${d}`, { recursive: true, force: true });
  }
}

async function build() {
  if (building) return { ok: false, reason: 'build-already-running' };
  building = true;
  const start = Date.now();
  try {
    // 1. astro build → OUT (katalog w kontenerze)  — stara wersja wciąż serwowana
    await execFileP('npm', ['run', 'build'], {
      cwd: '/app',
      env: { ...process.env, ASTRO_OUT_DIR: OUT },
      maxBuffer: 16 * 1024 * 1024,
    });

    // 2. skopiuj świeży wynik do nowej wersji na wolumenie
    counter += 1;
    const relName = `build-${start}-${counter}`;
    const rel = `${RELEASES}/${relName}`;
    await cp(OUT, rel, { recursive: true });

    // 3. ATOMOWA podmiana: symlink current → nowa wersja (rename jest atomowy)
    const tmp = `${CURRENT}.tmp`;
    await rm(tmp, { force: true });
    await symlink(rel, tmp);
    await rename(tmp, CURRENT);

    // 4. sprzątanie starych wersji
    await cleanup().catch(() => {});

    return { ok: true, release: relName, ms: Date.now() - start };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  } finally {
    building = false;
  }
}

const server = createServer(async (req, res) => {
  const send = (code, body) => {
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (req.url === '/health') {
    return existsSync(CURRENT) ? send(200, { ok: true }) : send(503, { ok: false });
  }
  if (req.url === '/rebuild' && (req.method === 'POST' || req.method === 'GET')) {
    const result = await build();
    return send(result.ok ? 200 : (result.reason ? 409 : 500), result);
  }
  send(404, { ok: false, error: 'not found' });
});

// build startowy, żeby strona istniała przed pierwszym wejściem
await mkdir(RELEASES, { recursive: true });
console.log('[builder] build startowy...');
console.log('[builder] start:', await build());
server.listen(8080, () => console.log('[builder] nasłuchuję na :8080'));
