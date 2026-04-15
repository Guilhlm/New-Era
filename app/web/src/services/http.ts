export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

type JsonLike = Record<string, unknown> | Array<unknown>;

async function parsePayload(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function toHttpError(response: Response, payload: unknown) {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const message = String((payload as { error: unknown }).error);
    return new HttpError(message || 'Request failed', response.status);
  }
  if (typeof payload === 'string' && payload.trim()) {
    return new HttpError(payload, response.status);
  }
  return new HttpError('Request failed', response.status);
}

async function requestJson<TResponse>(
  input: string,
  init: RequestInit = {},
  jsonBody?: JsonLike,
): Promise<TResponse> {
  const bodyFromInit = init.body;
  const body = jsonBody ? JSON.stringify(jsonBody) : bodyFromInit;

  const response = await fetch(input, {
    ...init,
    headers: {
      ...(jsonBody ? { 'Content-Type': 'application/json' } : null),
      ...init.headers,
    },
    body,
  });

  const payload = await parsePayload(response);
  if (!response.ok) throw toHttpError(response, payload);
  return (payload ?? {}) as TResponse;
}

export function getJson<TResponse>(input: string, init?: RequestInit) {
  return requestJson<TResponse>(input, {
    ...init,
    method: 'GET',
  });
}

export function postJson<TResponse, TBody extends JsonLike>(input: string, body: TBody, init?: RequestInit) {
  return requestJson<TResponse>(input, {
    ...init,
    method: 'POST',
  }, body);
}

export function patchJson<TResponse, TBody extends JsonLike>(input: string, body: TBody, init?: RequestInit) {
  return requestJson<TResponse>(input, {
    ...init,
    method: 'PATCH',
  }, body);
}
