import { NextResponse } from 'next/server';

import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';
import { searchExternalMarketAssets } from '@/app/api/finance/market/_lib/market-external';

const VALID_TABS = new Set(['stocks', 'crypto', 'etfs', 'mine']);

export async function handleMarketSearch(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTab = searchParams.get('tab') ?? 'stocks';
  const tab = rawTab === 'others' ? 'mine' : rawTab;
  const query = searchParams.get('q') ?? '';

  if (!VALID_TABS.has(tab)) {
    return NextResponse.json({ error: 'Invalid tab' }, { status: 400 });
  }

  if (tab === 'mine') {
    return proxyFinanceGet(
      `/finance/market/search?tab=${encodeURIComponent(tab)}&q=${encodeURIComponent(query)}`,
    );
  }

  try {
    const results = await searchExternalMarketAssets(tab, query, 10);
    return NextResponse.json({ results });
  } catch {
    const upstream = await proxyFinanceGet(
      `/finance/market/search?tab=${encodeURIComponent(tab)}&q=${encodeURIComponent(query)}`,
    );
    if (upstream.ok) return upstream;
    return NextResponse.json({ results: [] });
  }
}
