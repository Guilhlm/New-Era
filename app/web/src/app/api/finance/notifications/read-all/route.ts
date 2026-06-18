import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function POST() {
  return proxyFinanceWrite('/finance/notifications/read-all', 'POST', {});
}
