import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prismaDir = join(__dirname, '..', 'prisma');
const sourcePath = join(prismaDir, 'schema.prisma');
const targetPath = join(prismaDir, 'desktop', 'schema.prisma');

const source = readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');

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
  .replace(/^generator client \{[\s\S]*?\}\s*\n+/gm, '')
  .replace(/^datasource db \{[\s\S]*?\}\s*\n+/gm, '')
  .replace(/\s@db\.Decimal\([^)]*\)/g, '')
  .replace(/\s@db\.Date/g, '');

const output = desktopHeader + body;
const datasourceCount = (output.match(/^datasource db \{/gm) ?? []).length;

if (datasourceCount !== 1) {
  console.error(
    `Invalid desktop schema: expected 1 datasource block, found ${datasourceCount}.`,
  );
  process.exit(1);
}

writeFileSync(targetPath, output, 'utf8');
console.log(`Wrote ${targetPath}`);
