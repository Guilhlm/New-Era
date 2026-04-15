import { HealthResponse } from '@/types/api';
import { appConfig } from '@/config';
import { HttpError } from '@/services/http';

export const API_URL = appConfig.apiUrl.replace(/\/$/, '');

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new HttpError('Failed to reach API', response.status);
  }

  return response.json() as Promise<HealthResponse>;
}
