import type { 
  ApplicationRecord, 
  DocumentType, 
  PaymentInfo, 
  PersonalInfo, 
  DocumentSpecificDetails, 
  ServiceInfo 
} from '../types';

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

export interface AuthUserResponse {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'resident';
  fullName: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  underVerification: number;
  approved: number;
  readyForClaiming: number;
  rejected: number;
  successful?: number;
  submittedToday: number;
  byService: Record<string, number>;
}

export interface ApplicationHistoryItem {
  id: number;
  previousStatus: string | null;
  newStatus: string;
  actionType: string;
  remarks: string | null;
  changedBy: string;
  timestamp: string;
}

const API_BASE_URL = '/api';

/**
 * Base HTTP client with authorization header injection
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
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
    // Network disconnect, server down, or offline
    throw new Error('Unable to connect to the server. Check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && endpoint.startsWith('/staff')) {
      sessionStorage.removeItem('brgy_staff_authenticated');
      sessionStorage.removeItem('brgy_staff_token');
      sessionStorage.removeItem('brgy_staff_user');
    }
    // Never expose raw SQL errors, stack traces, or internal server dumps
    let message = data.message || `Request failed with status ${response.status}`;
    if (message.includes('SQL') || message.includes('ER_') || message.includes('SyntaxError')) {
      message = 'An unexpected server error occurred while processing your request. Please try again.';
    }
    throw new Error(message);
  }

  return data as T;
}

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  async login(credentials: { username: string; password: string }) {
    const res = await request<ApiResponse<{ token: string; user: AuthUserResponse }>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials)
      }
    );
    if (res.data?.token) {
      sessionStorage.setItem('brgy_staff_token', res.data.token);
      sessionStorage.setItem('brgy_staff_authenticated', 'true');
      sessionStorage.setItem('brgy_staff_user', res.data.user.username);
      sessionStorage.setItem('brgy_staff_name', res.data.user.fullName);
    }
    return res;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      sessionStorage.removeItem('brgy_staff_token');
      sessionStorage.removeItem('brgy_staff_authenticated');
      sessionStorage.removeItem('brgy_staff_user');
      sessionStorage.removeItem('brgy_staff_name');
    }
  },

  async getMe() {
    return request<ApiResponse<{ user: AuthUserResponse }>>('/auth/me');
  }
};

// ── Services API ─────────────────────────────────────────────────────────────
export const servicesApi = {
  async getAll(): Promise<ServiceInfo[]> {
    const res = await request<ApiResponse<ServiceInfo[]>>('/services');
    return res.data || [];
  },

  async getById(id: string): Promise<ServiceInfo | null> {
    const res = await request<ApiResponse<ServiceInfo>>(`/services/${id}`);
    return res.data || null;
  }
};

// ── Applications API ─────────────────────────────────────────────────────────
export interface CreateApplicationPayload {
  documentType: DocumentType;
  personalInfo: PersonalInfo;
  details: DocumentSpecificDetails;
  payment?: PaymentInfo;
}

export const applicationsApi = {
  async create(payload: CreateApplicationPayload): Promise<{ record: ApplicationRecord; referenceNumber: string }> {
    const res = await request<ApiResponse<ApplicationRecord>>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.data || !res.referenceNumber) {
      throw new Error(res.message || 'Failed to submit application.');
    }

    return {
      record: res.data,
      referenceNumber: res.referenceNumber
    };
  },

  async getAll(params?: {
    search?: string;
    status?: string;
    documentType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ applications: ApplicationRecord[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.documentType && params.documentType !== 'all') query.set('documentType', params.documentType);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const res = await request<ApiResponse<ApplicationRecord[]>>(`/applications${qs ? `?${qs}` : ''}`);

    return {
      applications: res.data || [],
      total: res.pagination?.total || (res.data ? res.data.length : 0)
    };
  },

  async getById(id: string): Promise<ApplicationRecord & { history?: ApplicationHistoryItem[] }> {
    const res = await request<ApiResponse<ApplicationRecord & { history?: ApplicationHistoryItem[] }>>(`/applications/${id}`);
    if (!res.data) throw new Error('Application not found.');
    return res.data;
  },

  async track(referenceNumber: string): Promise<ApplicationRecord> {
    const cleanRef = encodeURIComponent(referenceNumber.trim());
    const res = await request<ApiResponse<ApplicationRecord>>(`/applications/track/${cleanRef}`);
    if (!res.data) throw new Error(res.message || 'Application not found.');
    return res.data;
  },

  async getHistory(id: string): Promise<ApplicationHistoryItem[]> {
    const res = await request<ApiResponse<{ history: ApplicationHistoryItem[] }>>(`/applications/${id}/history`);
    return (res as any).history || [];
  }
};

// ── Staff Workflow API ───────────────────────────────────────────────────────
export const staffApi = {
  async approve(id: string, payload?: { remarks?: string; customControlNumber?: string }): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {})
    });
    if (!res.data) throw new Error(res.message || 'Failed to approve application.');
    return res.data;
  },

  async reject(id: string, payload: { reason: string; remarks?: string }): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (!res.data) throw new Error(res.message || 'Failed to reject application.');
    return res.data;
  },

  async moveToVerification(id: string, payload?: { remarks?: string }): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {})
    });
    if (!res.data) throw new Error(res.message || 'Failed to update application.');
    return res.data;
  },

  async markReady(id: string, payload?: { remarks?: string }): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/ready`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {})
    });
    if (!res.data) throw new Error(res.message || 'Failed to update application.');
    return res.data;
  },

  async markClaimed(id: string, payload?: { remarks?: string }): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/claim`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {})
    });
    if (!res.data) throw new Error(res.message || 'Failed to update application.');
    return res.data;
  }
};

// ── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await request<ApiResponse<DashboardStats>>('/dashboard/statistics');
    if (!res.data) {
      throw new Error('Failed to retrieve dashboard statistics.');
    }
    return res.data;
  }
};
