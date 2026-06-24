import { execSync } from 'node:child_process';

execSync('npx next build', {
  stdio: 'inherit',
  env: { ...process.env, APP_MODE: 'desktop' },
});
