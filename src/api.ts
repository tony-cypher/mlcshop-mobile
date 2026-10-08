import { Platform } from 'react-native';
import { getMemoryToken } from './storage';

/**
 * API configuration:
 * - When testing on web in browser: localhost:8000
 * - When testing on Android Emulator: 10.0.2.2:8000
 * - Or point directly to your deployed Render URL: https://mlcshop.onrender.com/api
 */
export const API_BASE_URL = 'https://mlcshop.onrender.com/api';

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getMemoryToken();
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(
      json.message ?? `Request failed (${response.status})`,
      response.status,
      json.errors ?? {},
    );
  }

  return json as T;
}
