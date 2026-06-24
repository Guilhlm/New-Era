import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(__dirname, '..');
const repoRoot = join(desktopRoot, '..', '..');
const apiRoot = join(repoRoot, 'app', 'api');
const webRoot = join(repoRoot, 'app', 'web');
const resourcesRoot = join(desktopRoot, 'resources');
const resourcesApi = join(resourcesRoot, 'api');
const resourcesWeb = join(resourcesRoot, 'web');
const resourcesPrisma = join(resourcesRoot, 'prisma');

function run(command, cwd, env = {}) {
  console.log(`> ${command}`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: true,
  });
}

function copyDir(from, to) {
  if (!existsSync(from)) {
    console.error(`Missing path: ${from}`);
    process.exit(1);
  }
  mkdirSync(dirname(to), { recursive: true });
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

function assertBuildArtifacts() {
  const required = [
    join(apiRoot, 'dist', 'main.js'),
    join(apiRoot, 'node_modules', '@prisma', 'client-desktop'),
    join(webRoot, '.next', 'standalone'),
    join(apiRoot, 'prisma', 'desktop', 'schema.prisma'),
  ];
  for (const path of required) {
    if (!existsSync(path)) {
      console.error(`Missing build artifact: ${path}`);
      console.error('Run the build:desktop steps through api/web build before prepare-resources.');
      process.exit(1);
    }
  }
}

assertBuildArtifacts();

console.log('=== prepare-resources: clean resources ===');
rmSync(resourcesRoot, { recursive: true, force: true });
mkdirSync(resourcesApi, { recursive: true });

console.log('=== prepare-resources: stage API dist + package manifest ===');
copyDir(join(apiRoot, 'dist'), join(resourcesApi, 'dist'));
cpSync(join(apiRoot, 'package.json'), join(resourcesApi, 'package.json'));

console.log('=== prepare-resources: install API production dependencies ===');
run('npm install --omit=dev --no-package-lock', resourcesApi);

console.log('=== prepare-resources: overlay Prisma desktop client + engines ===');
mkdirSync(join(resourcesApi, 'node_modules', '@prisma'), { recursive: true });
copyDir(
  join(apiRoot, 'node_modules', '@prisma', 'client-desktop'),
  join(resourcesApi, 'node_modules', '@prisma', 'client'),
);
if (existsSync(join(apiRoot, 'node_modules', '.prisma'))) {
  copyDir(
    join(apiRoot, 'node_modules', '.prisma'),
    join(resourcesApi, 'node_modules', '.prisma'),
  );
}

console.log('=== prepare-resources: stage Next standalone ===');
const standaloneSrc = join(webRoot, '.next', 'standalone');
copyDir(standaloneSrc, resourcesWeb);
// Monorepo standalone: server.js lives under app/web/ with distDir "./.next"
const standaloneWebDir = join(resourcesWeb, 'app', 'web');
mkdirSync(join(standaloneWebDir, '.next'), { recursive: true });
copyDir(join(webRoot, '.next', 'static'), join(standaloneWebDir, '.next', 'static'));
if (existsSync(join(webRoot, 'public'))) {
  copyDir(join(webRoot, 'public'), join(standaloneWebDir, 'public'));
}

console.log('=== prepare-resources: stage prisma desktop ===');
mkdirSync(resourcesPrisma, { recursive: true });
copyDir(join(apiRoot, 'prisma', 'desktop'), join(resourcesPrisma, 'desktop'));

console.log('=== prepare-resources: done ===');
