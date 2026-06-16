import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';

export async function GET(request: Request) {
  const period = new URL(request.url).searchParams.get('period') ?? '1W';
  return proxyFinanceGet(`/finance/summary/performance?period=${encodeURIComponent(period)}`);
}
