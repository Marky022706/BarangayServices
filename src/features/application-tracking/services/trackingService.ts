import { request, type ApiResponse } from '../../../services/api-client';
import type { ApplicationRecord } from '../../../types';

export const trackingService = {
  /**
   * Track application by reference number
   */
  async track(referenceNumber: string): Promise<ApplicationRecord> {
    const encoded = encodeURIComponent(referenceNumber.trim());
    const res = await request<ApiResponse<ApplicationRecord>>(`/applications/track/${encoded}`);
    return res.data || (res as any).application;
  }
};

export const applicationsApi = trackingService;

