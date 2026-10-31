export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  referenceNumber?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const API_BASE_URL = '/api';

/**
 * Base HTTP client with authorization header injection, credentials, and automatic retry
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = sessionStorage.getItem('brgy_staff_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  } catch (_netErr: any) {
    if (retries > 0 && options.method === 'GET') {
      await new Promise((r) => setTimeout(r, 600));
      return request<T>(endpoint, options, retries - 1);
    }
    throw new Error('Unable to connect to the Barangay e-Services server. Please check your network connection.');
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Server responded with status ${response.status}`;
    const err = new Error(errorMsg);
    (err as any).status = response.status;
    (err as any).data = data;
    throw err;
  }

  return data as T;
}

