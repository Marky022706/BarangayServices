import { request, type ApiResponse } from '../../../services/api-client';
import type { ApplicationRecord } from '../../../types';
import type { CreateApplicationPayload, ApplicationHistoryItem } from '../types/application.types';

export const applicationService = {
  /**
   * Submit new document application
   */
  async create(payload: CreateApplicationPayload): Promise<{ record: ApplicationRecord; referenceNumber: string }> {
    const res = await request<ApiResponse<ApplicationRecord>>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const record: ApplicationRecord = (res.data as any)?.application || res.data || (res as any).application;
    const referenceNumber = res.referenceNumber || record?.referenceNumber || '';
    return { record, referenceNumber };
  },

  /**
   * Fetch all applications with optional query params
   */
  async getAll(params: {
    status?: string;
    documentType?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ applications: ApplicationRecord[]; pagination?: any }> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.documentType) query.set('documentType', params.documentType);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request<ApiResponse<ApplicationRecord[]>>(`/applications${qs}`);
    const applications = res.data || (res as any).applications || [];
    return { applications, pagination: res.pagination };
  },

  /**
   * Fetch application by ID
   */
  async getById(id: string): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/applications/${id}`);
    return (res.data as any)?.application || res.data || (res as any).application;
  },

  /**
   * Fetch application lifecycle audit history
   */
  async getHistory(id: string): Promise<ApplicationHistoryItem[]> {
    const res = await request<ApiResponse<ApplicationHistoryItem[]>>(`/applications/${id}/history`);
    return res.data || (res as any).history || [];
  }
};
