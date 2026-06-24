import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');
const apiRoot = join(repoRoot, 'app', 'api');
const clientDesktop = join(apiRoot, 'node_modules', '@prisma', 'client-desktop');

function run(command, cwd = repoRoot) {
  console.log(`> ${command}`);
  execSync(command, { cwd, stdio: 'inherit', shell: true });
}

console.log('=== prepare-api-desktop ===');

if (!existsSync(clientDesktop)) {
  console.log('Generating Prisma desktop client...');
  run('npm run prisma:generate:desktop -w app/api');
}

run('node scripts/copy-prisma-client-desktop.mjs', apiRoot);
run('npm run build -w app/api');

console.log('=== prepare-api-desktop: done ===');
