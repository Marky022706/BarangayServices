export interface DashboardTrendPoint {
  date: string;
  label: string;
  count: number;
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
  dailyTrends?: DashboardTrendPoint[];
}

