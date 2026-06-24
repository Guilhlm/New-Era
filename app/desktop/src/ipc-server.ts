import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import log from 'electron-log';
import { IPC_PORT } from './paths';

export type NotifyPayload = {
  notificationId: string;
  title: string;
  body: string;
  href?: string | null;
  priority?: string;
};

export type IpcServerHandle = {
  close: () => void;
};

export function startIpcServer(
  token: string,
  onNotify: (payload: NotifyPayload) => void,
): Promise<IpcServerHandle> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method === 'POST' && req.url === '/notify') {
        if (req.headers['x-ipc-token'] !== token) {
          res.writeHead(401);
          res.end('unauthorized');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body) as NotifyPayload;
            log.info(`IPC notify received: ${payload.title}`);
            onNotify(payload);
            res.writeHead(204);
            res.end();
          } catch (error) {
            log.warn(`IPC notify parse error: ${String(error)}`);
            res.writeHead(400);
            res.end('bad request');
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('not found');
    });

    server.on('error', reject);
    server.listen(IPC_PORT, '127.0.0.1', () => {
      log.info(`IPC server listening on 127.0.0.1:${IPC_PORT}`);
      resolve({
        close: () => server.close(),
      });
    });
  });
}
