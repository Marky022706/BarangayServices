import type {
  ApplicationRecord,
  DocumentType,
  PaymentInfo,
  PersonalInfo,
  DocumentSpecificDetails
} from '../../../types';

export type { ApplicationRecord };

export interface CreateApplicationPayload {
  documentType: DocumentType;
  personalInfo: PersonalInfo;
  details: DocumentSpecificDetails;
  payment: PaymentInfo;
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

