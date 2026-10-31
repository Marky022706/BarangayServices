import { request, type ApiResponse } from '../../../services/api-client';
import type { ServiceInfo } from '../../../types';

export const documentServicesApi = {
  /**
   * Fetch all available barangay services and fees
   */
  async getAll(): Promise<ServiceInfo[]> {
    const res = await request<ApiResponse<ServiceInfo[]>>('/services');
    return res.data || (res as any) || [];
  },

  /**
   * Fetch specific service by ID
   */
  async getById(serviceId: string): Promise<ServiceInfo> {
    const res = await request<ApiResponse<ServiceInfo>>(`/services/${serviceId}`);
    return res.data || (res as any);
  }
};

export const servicesApi = documentServicesApi;

