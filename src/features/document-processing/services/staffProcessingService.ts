import { request, type ApiResponse } from '../../../services/api-client';
import type { ApplicationRecord } from '../../../types';

export const staffProcessingService = {
  /**
   * Advance application to Under Verification
   */
  async moveToVerification(id: string, payload: { remarks?: string } = {}): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (res.data as any)?.application || res.data || (res as any).application;
  },

  /**
   * Approve application and assign control number
   */
  async approve(id: string, payload: { remarks?: string; customControlNumber?: string } = {}): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (res.data as any)?.application || res.data || (res as any).application;
  },

  /**
   * Reject application with formal reason
   */
  async reject(id: string, payload: { reason: string; remarks?: string }): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (res.data as any)?.application || res.data || (res as any).application;
  },

  /**
   * Mark document as ready for claiming at Window 2
   */
  async markReady(id: string, payload: { remarks?: string } = {}): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/ready`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (res.data as any)?.application || res.data || (res as any).application;
  },

  /**
   * Confirm document claimed by citizen
   */
  async markClaimed(id: string, payload: { remarks?: string } = {}): Promise<ApplicationRecord> {
    const res = await request<ApiResponse<ApplicationRecord>>(`/staff/applications/${id}/claim`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (res.data as any)?.application || res.data || (res as any).application;
  }
};
