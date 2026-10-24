export type DocumentType = 'clearance' | 'indigency' | 'residency';

export type ApplicationStatus = 
  | 'Pending Review' 
  | 'Under Verification' 
  | 'Approved' 
  | 'Rejected' 
  | 'Ready for Claiming';

export type PaymentMethod = 'gcash' | 'pay_on_pickup';

export type PaymentStatus = 'Pending' | 'Paid' | 'Waived';

export type CivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Divorced';

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  civilStatus: CivilStatus;
  contactNumber: string;
  email?: string;
  houseStreet?: string;
  purokSitio: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
}

export interface DocumentSpecificDetails {
  // Common purpose
  purpose: string;
  otherPurpose?: string;

  // Certificate of Indigency specific
  assistanceType?: string;
  additionalInfo?: string;

  // Certificate of Residency specific
  lengthOfResidency?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  // GCash-specific fields
  gcashNumber?: string;
  gcashName?: string;
  gcashReferenceNumber?: string;
  amountPaid?: string;
}

export interface ApplicationRecord {
  id: string;
  referenceNumber: string;
  documentType: DocumentType;
  personalInfo: PersonalInfo;
  details: DocumentSpecificDetails;
  payment: PaymentInfo;
  status: ApplicationStatus;
  submissionDate: string;
  lastUpdatedDate: string;
  rejectionReason?: string;
  controlNumber?: string;
  remarks?: string;
  verifiedBy?: string;
}

// Service definition for UI display
export interface ServiceInfo {
  id: DocumentType;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: 'FileCheck' | 'HandHeart' | 'House';
  standardFee: string;
  processingTime: string;
  requirements: string[];
}
