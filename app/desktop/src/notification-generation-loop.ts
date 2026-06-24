import log from 'electron-log';
import type { DesktopConfig } from './config-store';

const GENERATE_INTERVAL_MS = 45_000;
const GENERATE_BOOTSTRAP_DELAY_MS = 3_000;

export function startDesktopNotificationGenerationLoop(
  config: DesktopConfig,
  apiPort: number,
) {
  const url = `http://127.0.0.1:${apiPort}/notifications/desktop/generate`;
  let running = false;

  async function tick(reason: string) {
    if (running) return;
    running = true;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Desktop-Token': config.ipcToken,
        },
      });
      if (!response.ok) {
        log.warn(`Desktop notification generate failed (${reason}): HTTP ${response.status}`);
      }
    } catch (error) {
      log.warn(
        `Desktop notification generate unreachable (${reason}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      running = false;
    }
  }

  setTimeout(() => {
    void tick('bootstrap');
  }, GENERATE_BOOTSTRAP_DELAY_MS);

  setInterval(() => {
    void tick('interval');
  }, GENERATE_INTERVAL_MS);
}
