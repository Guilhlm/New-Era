import { proxyFinanceGet } from '@/app/api/finance/_lib/proxy';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  const period = url.searchParams.get('period');
  const kind = url.searchParams.get('kind');
  const category = url.searchParams.get('category');
  const unreadOnly = url.searchParams.get('unreadOnly');
  const limit = url.searchParams.get('limit');
  if (period) params.set('period', period.toUpperCase());
  if (kind) params.set('kind', kind.toUpperCase());
  if (category) params.set('category', category.toUpperCase());
  if (unreadOnly === 'true') params.set('unreadOnly', 'true');
  if (limit) params.set('limit', limit);

  return proxyFinanceGet(
    `/finance/notifications${params.toString() ? `?${params.toString()}` : ''}`,
  );
}
