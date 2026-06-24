import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(__dirname, '..');
const clientDesktop = join(apiRoot, 'node_modules', '@prisma', 'client-desktop');
const clientDefault = join(apiRoot, 'node_modules', '@prisma', 'client');

if (!existsSync(clientDesktop)) {
  console.error('Missing @prisma/client-desktop. Run prisma:generate:desktop first.');
  process.exit(1);
}

rmSync(clientDefault, { recursive: true, force: true });
mkdirSync(join(apiRoot, 'node_modules', '@prisma'), { recursive: true });
cpSync(clientDesktop, clientDefault, { recursive: true });
console.log('Copied @prisma/client-desktop -> @prisma/client');
