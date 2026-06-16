import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';
import { buildExternalMarketAssetRow } from '@/app/api/finance/market/_lib/market-external';

const VALID_TABS = new Set(['stocks', 'crypto', 'etfs', 'mine']);
const VALID_CURRENCIES = new Set(['USDT', 'BRL']);

type MarketAssetRowPayload = {
  row?: {
    priceUsdt?: number;
  } | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTab = searchParams.get('tab') ?? 'stocks';
  const tab = rawTab === 'others' ? 'mine' : rawTab;
  const currency = searchParams.get('currency') ?? 'USDT';
  const ticker = searchParams.get('ticker') ?? '';
  const coinId = searchParams.get('coinId') ?? '';
  const assetName = searchParams.get('name') ?? '';

  if (!VALID_TABS.has(tab)) {
    return Response.json({ error: 'Invalid tab' }, { status: 400 });
  }
  if (!VALID_CURRENCIES.has(currency)) {
    return Response.json({ error: 'Invalid currency' }, { status: 400 });
  }
  if (!ticker.trim()) {
    return Response.json({ error: 'Ticker is required' }, { status: 400 });
  }

  if (tab === 'crypto' && coinId.trim()) {
    try {
      const external = await buildExternalMarketAssetRow(tab, currency, ticker, {
        coinId: coinId.trim(),
        name: assetName.trim() || undefined,
      });
      if (external?.row && external.row.priceUsdt > 0) {
        return Response.json(external);
      }
    } catch {
      // fall through to Nest
    }
  }

  const upstream = await proxyFinanceGet(
    `/finance/market/asset?tab=${encodeURIComponent(tab)}&currency=${encodeURIComponent(currency)}&ticker=${encodeURIComponent(ticker)}`,
  );

  if (upstream.ok) {
    try {
      const payload = (await upstream.clone().json()) as MarketAssetRowPayload;
      const priceUsdt = payload.row?.priceUsdt ?? 0;
      if (priceUsdt > 0) {
        return upstream;
      }
    } catch {
      // fall through to external quote
    }
  }

  if (tab === 'mine') {
    return upstream;
  }

  try {
    const external = await buildExternalMarketAssetRow(tab, currency, ticker, {
      coinId: coinId.trim() || undefined,
      name: assetName.trim() || undefined,
    });
    if (external?.row && external.row.priceUsdt > 0) {
      return Response.json(external);
    }
  } catch {
    // keep upstream response
  }

  return upstream;
}
