import { proxyAuthedGet, proxyAuthedWrite } from '@/app/api/_lib/upstream-proxy';

export async function proxyFinanceGet(path: string) {
  return proxyAuthedGet(path, 'Finance request failed');
}

export async function proxyFinanceWrite(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, unknown>,
) {
  return proxyAuthedWrite(path, method, body, 'Finance request failed');
}
