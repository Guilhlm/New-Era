import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prismaDir = join(__dirname, '..', 'prisma');
const sourcePath = join(prismaDir, 'schema.prisma');
const targetPath = join(prismaDir, 'desktop', 'schema.prisma');

const source = readFileSync(sourcePath, 'utf8');

const desktopHeader = `// Auto-generated from schema.prisma — run: node scripts/sync-desktop-schema.mjs
// Do not edit manually; regenerate after schema changes.

generator client {
  provider      = "prisma-client-js"
  output        = "../../node_modules/@prisma/client-desktop"
  binaryTargets = ["native"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

`;

let body = source
  .replace(/^\/\/.*\n/gm, '')
  .replace(/^generator client \{[\s\S]*?\}\n\n/m, '')
  .replace(/^datasource db \{[\s\S]*?\}\n\n/m, '')
  .replace(/\s@db\.Decimal\([^)]*\)/g, '')
  .replace(/\s@db\.Date/g, '');

writeFileSync(targetPath, desktopHeader + body, 'utf8');
console.log(`Wrote ${targetPath}`);
