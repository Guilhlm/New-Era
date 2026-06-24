import { execSync } from 'node:child_process';

execSync('next build', {
  stdio: 'inherit',
  env: { ...process.env, APP_MODE: 'desktop' },
});
