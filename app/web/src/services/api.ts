import { HealthResponse } from '@/types/api';
import { appConfig } from '@/config';

export const API_URL = appConfig.apiUrl.replace(/\/$/, '');

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar a API');
  }

  return response.json() as Promise<HealthResponse>;
}
