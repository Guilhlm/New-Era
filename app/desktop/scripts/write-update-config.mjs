import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const resourcesRoot = join(desktopRoot, 'resources');
const configPath = join(resourcesRoot, 'update-config.json');
const token = process.env.DESKTOP_UPDATE_GH_TOKEN?.trim();

mkdirSync(resourcesRoot, { recursive: true });

const payload = token ? { githubToken: token } : {};
writeFileSync(configPath, JSON.stringify(payload), 'utf8');

if (token) {
  console.log('Wrote resources/update-config.json with GitHub update token.');
} else {
  console.log('Wrote resources/update-config.json without token (public repo required for auto-update).');
}
