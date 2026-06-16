import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';

export async function GET() {
  return proxyFinanceGet('/finance/market/fx');
}
