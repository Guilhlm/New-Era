import http from 'node:http';
import httpProxy from 'http-proxy';

const targetPort = 6002;
const publicPort = 6000;

const proxy = httpProxy.createProxyServer({
  target: `http://localhost:${targetPort}`,
  ws: true,
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

proxy.on('error', (_err, _req, res) => {
  if (res && 'writeHead' in res) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy não conseguiu conectar no Next.js (porta 6002).');
  }
});

server.listen(publicPort, () => {
  console.log(`Proxy web ativo em http://localhost:${publicPort} -> ${targetPort}`);
});
