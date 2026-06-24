import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(__dirname, '..');
const repoRoot = join(apiRoot, '..', '..');
const localClient = join(apiRoot, 'node_modules', '@prisma', 'client');
const rootClient = join(repoRoot, 'node_modules', '@prisma', 'client');

function clientLooksValid(clientPath) {
  return (
    existsSync(clientPath) &&
    existsSync(join(clientPath, 'index.js')) &&
    existsSync(join(clientPath, 'package.json'))
  );
}

function copyClient(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

if (clientLooksValid(localClient)) {
  process.exit(0);
}

if (clientLooksValid(rootClient)) {
  copyClient(rootClient, localClient);
  console.log('Ensured @prisma/client in app/api from workspace root.');
  process.exit(0);
}

console.log('Installing @prisma/client in app/api...');
execSync('npm install @prisma/client@6.16.3 --no-save', {
  cwd: apiRoot,
  stdio: 'inherit',
  shell: true,
});

if (!clientLooksValid(localClient)) {
  console.error('Failed to ensure @prisma/client in app/api/node_modules.');
  process.exit(1);
}
