/**
 * Consolidated API Services Barrel & Backward Compatibility Layer
 * Re-exports modular feature services from their domain folders.
 */
export * from './api-client';
export * from '../features/authentication/types/auth.types';
export * from '../features/dashboard/types/dashboard.types';
export * from '../features/applications/types/application.types';

export { authService as authApi } from '../features/authentication/services/authService';
export { documentServicesApi as servicesApi } from '../features/document-services/services/documentServicesApi';
export { applicationService as applicationsApi } from '../features/applications/services/applicationService';
export { trackingService } from '../features/application-tracking/services/trackingService';
export { staffProcessingService as staffApi } from '../features/document-processing/services/staffProcessingService';
export { dashboardService as dashboardApi } from '../features/dashboard/services/dashboardService';
