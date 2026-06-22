import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';

const VALID_TABS = new Set(['stocks', 'crypto', 'etfs', 'mine']);

export async function GET(request: Request) {
  const rawTab = new URL(request.url).searchParams.get('tab');
  const tab = rawTab === 'others' ? 'mine' : rawTab;
  const path =
    tab && VALID_TABS.has(tab)
      ? `/finance/investments?tab=${encodeURIComponent(tab)}`
      : '/finance/investments';
  return proxyFinanceGet(path);
}
