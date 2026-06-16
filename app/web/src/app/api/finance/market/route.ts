import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';
import { handleMarketSearch } from '@/app/api/finance/market/_lib/market-search-handler';
import { buildExternalMarketBoardPage } from '@/app/api/finance/market/_lib/market-external';

const VALID_TABS = new Set(['stocks', 'crypto', 'etfs', 'mine']);
const VALID_CURRENCIES = new Set(['USDT', 'BRL']);

type MarketBoardPayload = {
  rows?: Array<{ priceUsdt?: number }>;
  total?: number;
};

function parseOffset(raw: string | null) {
  const value = Number.parseInt(raw ?? '0', 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function parseLimit(raw: string | null) {
  const value = Number.parseInt(raw ?? '20', 10);
  if (!Number.isFinite(value) || value < 1) return 20;
  return Math.min(value, 50);
}

function boardHasLivePrices(payload: MarketBoardPayload) {
  const rows = payload.rows ?? [];
  if (rows.length === 0) return false;
  return rows.some((row) => (row.priceUsdt ?? 0) > 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.has('q')) {
    return handleMarketSearch(request);
  }

  const rawTab = searchParams.get('tab') ?? 'stocks';
  const tab = rawTab === 'others' ? 'mine' : rawTab;
  const currency = searchParams.get('currency') ?? 'USDT';
  const offset = parseOffset(searchParams.get('offset'));
  const limit = parseLimit(searchParams.get('limit'));

  if (!VALID_TABS.has(tab)) {
    return Response.json({ error: 'Invalid tab' }, { status: 400 });
  }
  if (!VALID_CURRENCIES.has(currency)) {
    return Response.json({ error: 'Invalid currency' }, { status: 400 });
  }

  const upstream = await proxyFinanceGet(
    `/finance/market?tab=${encodeURIComponent(tab)}&currency=${encodeURIComponent(currency)}&offset=${encodeURIComponent(String(offset))}&limit=${encodeURIComponent(String(limit))}`,
  );

  if (tab === 'mine') return upstream;

  if (upstream.ok) {
    const payload = (await upstream.clone().json()) as MarketBoardPayload;
    const total = typeof payload.total === 'number' ? payload.total : payload.rows?.length ?? 0;

    if (tab === 'crypto') {
      if (boardHasLivePrices(payload) && total > 0) {
        return upstream;
      }
    } else if (total > 30) {
      return upstream;
    }
  }

  try {
    const board = await buildExternalMarketBoardPage(tab, currency, offset, limit);
    return Response.json(board);
  } catch {
    return upstream;
  }
}
