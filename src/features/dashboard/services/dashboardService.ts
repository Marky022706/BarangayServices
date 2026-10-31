import { request, type ApiResponse } from '../../../services/api-client';
import type { DashboardStats } from '../types/dashboard.types';

export const dashboardService = {
  /**
   * Fetch live KPI metrics, status distributions, and 30-day trends
   */
  async getStats(): Promise<DashboardStats> {
    const res = await request<ApiResponse<DashboardStats>>('/dashboard/statistics');
    return res.data || (res as any);
  }
};

