import React, { useState, useEffect } from 'react';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { FormInput } from '../../../components/forms/FormInput';
import { ServiceCard } from '../../document-services/components/ServiceCard';
import type { 
  DocumentType, 
  PersonalInfo, 
  DocumentSpecificDetails, 
  ApplicationRecord,
  PaymentMethod,
  PaymentInfo,
  ServiceInfo
} from '../../../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Info, 
  Search, 
  BarangaySeal,
  Copy,
  Check
} from '../../../components/Icons';
import { applicationService as applicationsApi } from '../services/applicationService';
import { documentServicesApi as servicesApi } from '../../document-services/services/documentServicesApi';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/feedback/Toast';
import { ConfirmationModal } from '../../../components/modals/ConfirmationModal';
import { CardSkeleton } from '../../../components/feedback/SkeletonLoader';

const DRAFT_STORAGE_KEY = 'brgy_application_draft_v1';
export const RECENT_REFERENCES_KEY = 'brgy_recent_references_v1';

export interface RecentReferenceItem {
  referenceNumber: string;
  documentType: DocumentType;
  applicantName: string;
  submissionDate: string;
}

interface ApplyProps {
  initialDocumentType?: DocumentType | null;
  onSubmitApplication: (newApp: ApplicationRecord) => void;
  onNavigate: (path: string, param?: string) => void;
}

export const ApplyPage: React.FC<ApplyProps> = ({
  initialDocumentType,
  onSubmitApplication,
  onNavigate
}) => {
  const toast = useToast();
  const [copiedRef, setCopiedRef] = useState(false);

  // Load any saved draft from sessionStorage so users don't lose progress (Heuristic 3)
  const loadSavedDraft = () => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore storage parse issues
    }
    return null;
  };

  const savedDraft = loadSavedDraft();

  // Step state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(() =>
    savedDraft?.currentStep && savedDraft.currentStep < 6 ? savedDraft.currentStep : 1
  );

  // Step 1: Selected document
  const [selectedDocId, setSelectedDocId] = useState<DocumentType | null>(
    initialDocumentType || savedDraft?.selectedDocId || null
  );
  const [availableServices, setAvailableServices] = useState<ServiceInfo[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [servicesError, setServicesError] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  const fetchServices = () => {
    setIsLoadingServices(true);
    setServicesError('');
    servicesApi.getAll().then((data) => {
      if (data && data.length > 0) setAvailableServices(data);
    }).catch((err) => {
      console.error('Failed to load services:', err);
      setServicesError('Unable to load available barangay documents. Please check your connection and retry.');
    }).finally(() => {
      setIsLoadingServices(false);
    });
  };

  // Load official services directly from database
  useEffect(() => {
    fetchServices();
  }, []);

  // If initialDocumentType prop changes or is provided, sync it
  useEffect(() => {
    if (initialDocumentType) {
      setSelectedDocId(initialDocumentType);
    }
  }, [initialDocumentType]);

  // Step 2: Personal Information State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() =>
    savedDraft?.personalInfo || {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateOfBirth: '',
      placeOfBirth: '',
      civilStatus: 'Single',
      contactNumber: '',
      email: '',
      houseStreet: '',
      purokSitio: 'Purok 1',
      barangay: 'Barangay San Isidro',
      cityMunicipality: 'Quezon City',
      province: 'Metro Manila'
    }
  );

  // Step 3: Document Details State
  const [docDetails, setDocDetails] = useState<DocumentSpecificDetails>(() =>
    savedDraft?.docDetails || {
      purpose: '',
      otherPurpose: '',
      assistanceType: '',
      additionalInfo: '',
      lengthOfResidency: '1 - 3 Years'
    }
  );

  // Step 4: Review State
  const [agreedToPrivacy, setAgreedToPrivacy] = useState<boolean>(false);

  // Step 5: Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() =>
    savedDraft?.paymentMethod || 'pay_on_pickup'
  );
  const [gcashNumber, setGcashNumber] = useState(() => savedDraft?.gcashNumber || '');
  const [gcashName, setGcashName] = useState(() => savedDraft?.gcashName || '');

  // Persist draft automatically while in steps 1-5 (Heuristic 3: User Control & Freedom)
  useEffect(() => {
    if (currentStep < 6) {
      try {
        sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            currentStep,
            selectedDocId,
            personalInfo,
            docDetails,
            paymentMethod,
            gcashNumber,
            gcashName
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [currentStep, selectedDocId, personalInfo, docDetails, paymentMethod, gcashNumber, gcashName]);

  // Step 6: Submitted Record
  const [submittedRecord, setSubmittedRecord] = useState<ApplicationRecord | null>(null);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Current Selected Service Info from Live MySQL Database
  const selectedService = availableServices.find((s) => s.id === selectedDocId);

  // Handle Personal Info Changes
  const handlePersonalInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle Document Details Changes
  const handleDocDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDocDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Validation function per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedDocId) {
        newErrors.document = 'Please choose a document to request before proceeding.';
      }
    } else if (step === 2) {
      if (!personalInfo.firstName.trim()) newErrors.firstName = 'Please enter your First Name.';
      if (!personalInfo.lastName.trim()) newErrors.lastName = 'Please enter your Last Name.';
      if (!personalInfo.dateOfBirth) {
        newErrors.dateOfBirth = 'Please select your Date of Birth.';
      } else {
        const dobDate = new Date(personalInfo.dateOfBirth);
        const now = new Date();
        if (isNaN(dobDate.getTime()) || dobDate > now || dobDate.getFullYear() < 1900) {
          newErrors.dateOfBirth = 'Please enter a valid Date of Birth that is not in the future.';
        }
      }
      if (!personalInfo.placeOfBirth.trim()) newErrors.placeOfBirth = 'Please enter your Place of Birth (City/Municipality).';
      if (!personalInfo.contactNumber.trim()) {
        newErrors.contactNumber = 'Mobile contact number is required for status updates.';
      } else if (!/^(09|\+639)\d{9}$/.test(personalInfo.contactNumber.replace(/[\s-]/g, ''))) {
        newErrors.contactNumber = 'Enter a valid 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).';
      }
      if (personalInfo.email && personalInfo.email.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email.trim())) {
          newErrors.email = 'Please enter a valid email address (e.g. juan.delacruz@email.com) or leave it blank.';
        }
      }
      if (!personalInfo.purokSitio.trim()) newErrors.purokSitio = 'Please specify your Purok, Sitio, or Zone.';
      if (!personalInfo.barangay.trim()) newErrors.barangay = 'Barangay name is required.';
      if (!personalInfo.cityMunicipality.trim()) newErrors.cityMunicipality = 'City or Municipality is required.';
      if (!personalInfo.province.trim()) newErrors.province = 'Province is required.';
    } else if (step === 3) {
      if (!docDetails.purpose.trim()) {
        newErrors.purpose = 'Please select or specify the purpose of your request.';
      }
      if (docDetails.purpose === 'Other' && !docDetails.otherPurpose?.trim()) {
        newErrors.otherPurpose = 'Please specify the exact other purpose.';
      }
      if (selectedDocId === 'indigency' && !docDetails.assistanceType?.trim()) {
        newErrors.assistanceType = 'Please indicate the type of assistance requested.';
      }
      if (selectedDocId === 'residency' && !docDetails.lengthOfResidency?.trim()) {
        newErrors.lengthOfResidency = 'Please specify length of residency.';
      }
    } else if (step === 4) {
      if (!agreedToPrivacy) {
        newErrors.privacy = 'You must confirm the truthfulness of the information and accept the privacy notice.';
      }
    } else if (step === 5) {
      if (paymentMethod === 'gcash') {
        if (!gcashNumber.trim()) {
          newErrors.gcashNumber = 'Please enter your GCash number.';
        } else if (!/^09\d{9}$/.test(gcashNumber.replace(/\s/g, ''))) {
          newErrors.gcashNumber = 'Enter a valid GCash number (e.g. 09171234567).';
        }
        if (!gcashName.trim()) {
          newErrors.gcashName = 'Please enter the account name registered with GCash.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next Step Action
  const handleContinue = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Back Action
  const handleBack = () => {
    if (currentStep > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Jump to specific step from Review
  const handleEditStep = (stepNumber: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(stepNumber);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCopyRef = (refNum: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(refNum).then(() => {
      setCopiedRef(true);
      toast.success(`Reference number ${refNum} copied to clipboard!`, 'Copied');
      setTimeout(() => setCopiedRef(false), 2500);
    }).catch(() => {
      toast.info(`Reference number: ${refNum}`, 'Reference Code');
    });
  };

  // Step 4 → 5 (Review → Payment)
  // Step 5 → 6 (Payment → submit + Confirmation)
  const handleSubmitApplication = async () => {
    if (!validateStep(5) || !selectedDocId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const paymentInfo: PaymentInfo = {
      method: paymentMethod,
      status: paymentMethod === 'gcash' ? 'Pending' : 'Pending',
      gcashNumber: paymentMethod === 'gcash' ? gcashNumber : undefined,
      gcashName: paymentMethod === 'gcash' ? gcashName : undefined,
      amountPaid: selectedService?.standardFee ?? '₱0'
    };

    try {
      const { record } = await applicationsApi.create({
        documentType: selectedDocId,
        personalInfo: { ...personalInfo },
        details: { ...docDetails },
        payment: paymentInfo
      });

      onSubmitApplication(record);
      setSubmittedRecord(record);

      // Clear draft from sessionStorage and save reference number to localStorage for quick tracking (Heuristics 3, 6 & 7)
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        const existingRaw = localStorage.getItem(RECENT_REFERENCES_KEY);
        const existingList: RecentReferenceItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        const newItem: RecentReferenceItem = {
          referenceNumber: record.referenceNumber,
          documentType: record.documentType,
          applicantName: `${record.personalInfo.firstName} ${record.personalInfo.lastName}`,
          submissionDate: record.submissionDate
        };
        const updatedList = [
          newItem,
          ...existingList.filter((item) => item.referenceNumber !== record.referenceNumber)
        ].slice(0, 5);
        localStorage.setItem(RECENT_REFERENCES_KEY, JSON.stringify(updatedList));
      } catch {
        // Ignore storage errors
      }

      toast.success(
        'Your application has been submitted successfully.',
        'Application Confirmed'
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(6);
    } catch (err: any) {
      const msg = err.message || "We couldn't submit your application right now. Your entered information has been saved—please check your connection and click Retry.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancelApplication = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setShowCancelModal(false);
    toast.info('Your application draft has been cleared.', 'Application Cancelled');
    onNavigate('/');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 120px)', padding: '2rem 1rem 5rem 1rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        
        {/* Step Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#1e40af',
              backgroundColor: '#eff6ff',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}
          >
            <BarangaySeal className="w-3.5 h-3.5" />
            <span>Online Document Application Form</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {currentStep === 6 ? 'Application Confirmed' : 'Document Application Process'}
          </h1>
          <p style={{ fontSize: '0.925rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            {currentStep === 6
              ? 'Your application has been received. Please save your reference number.'
              : 'Please provide accurate information as it will appear in your official document.'}
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} onStepClick={handleEditStep} allowStepClick={currentStep < 6} />

        {/* Form Container Card */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          {/* Full-Card Loading Overlay during Application Submission (Heuristic 1: Visibility of System Status) */}
          {isSubmitting && (
            <div
              role="status"
              aria-live="assertive"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(3px)',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}
            >
              <Spinner size="lg" color="#2563eb" ariaLabel="Submitting your barangay document application" />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '1rem' }}>
                Submitting Your Application...
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', maxWidth: '380px', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Please wait while we register your request and generate your official Barangay Reference Number. Do not close this page.
              </p>
            </div>
          )}

          {/* Persistent Selected Service & Requirements Context Bar on Steps 2-5 (Heuristic 6: Recognition Rather Than Recall) */}
          {currentStep >= 2 && currentStep <= 5 && selectedService && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '0.875rem 2rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem' }}>
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}
                >
                  Selected Service
                </span>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{selectedService.title}</strong>
                <span style={{ color: '#64748b' }}>&bull; Fee: <strong>{selectedService.standardFee}</strong></span>
                <span style={{ color: '#64748b' }}>&bull; Processing: <strong>{selectedService.processingTime}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('/help')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  View Requirements &amp; Help
                </button>
                <button
                  type="button"
                  onClick={() => handleEditStep(1)}
                  style={{
                    background: 'none',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Change Document
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: SELECT DOCUMENT */}
          {currentStep === 1 && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Step 1: Choose Your Document
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                  Select the certificate or clearance you need from the list below.
                </p>
              </div>

              {errors.document && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errors.document}</span>
                </div>
              )}

              {/* 3 Selectable Document Cards */}
              {isLoadingServices ? (
                <div style={{ marginBottom: '2rem' }}>
                  <CardSkeleton count={3} />
                </div>
              ) : servicesError ? (
                <div
                  role="alert"
                  style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                  }}
                >
                  <AlertCircle className="w-7 h-7" style={{ color: '#dc2626', margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.35rem' }}>
                    Unable to Load Document Options
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: '0 0 1rem 0' }}>{servicesError}</p>
                  <button
                    type="button"
                    onClick={fetchServices}
                    style={{
                      padding: '0.5rem 1.1rem',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Retry Loading Documents
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2rem'
                  }}
                >
                  {availableServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onApply={(id) => {
                        setSelectedDocId(id);
                        if (errors.document) {
                          setErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.document;
                            return updated;
                          });
                        }
                      }}
                      isSelectable={true}
                      isSelected={selectedDocId === service.id}
                    />
                  ))}
                </div>
              )}

              {/* Requirements & Description Preview for the chosen document */}
              {selectedService ? (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
                      {selectedService.title} Details & Requirements
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {selectedService.fullDescription}
                  </p>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    Standard Documentary Requirements (Subject to Barangay Verification):
                  </div>

                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#475569' }}>
                    {selectedService.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                    <span>Estimated Standard Fee: <strong>{selectedService.standardFee}</strong></span>
                    <span>Turnaround: <strong>{selectedService.processingTime}</strong></span>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.9rem'
                }}>
                  Please click one of the three document options above to proceed.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PERSONAL INFORMATION */}
          {currentStep === 2 && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Step 2: Personal Information
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                  Enter your complete legal name, birth details, and residential address as registered in the barangay.
                </p>
              </div>

              {/* PSA-inspired instructional tip */}
              <div style={{
                marginBottom: '1.5rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.5rem',
                padding: '0.875rem 1rem',
                fontSize: '0.825rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem'
              }}>
                <ShieldCheck className="w-5 h-5 flex-shrink-0" style={{ color: '#2563eb', marginTop: '1px' }} />
                <span>
                  Please double check your spelling. The name entered here will be printed verbatim on your official certification.
                </span>
              </div>

              {/* Section 1: Full Legal Name */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                  1. Full Legal Name
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                  <FormInput
                    label="First Name"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="e.g. Juan"
                    error={errors.firstName}
                  />

                  <FormInput
                    label="Middle Name (Optional)"
                    name="middleName"
                    value={personalInfo.middleName || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="e.g. Santos (Leave blank if none)"
                  />

                  <FormInput
                    label="Last Name"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="e.g. Dela Cruz"
                    error={errors.lastName}
                  />

                  <FormInput
                    label="Suffix (Optional)"
                    name="suffix"
                    value={personalInfo.suffix || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>
              </div>

              {/* Section 2: Birth Details & Civil Status */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                  2. Birth Details & Civil Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                  <FormInput
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={handlePersonalInfoChange}
                    required
                    error={errors.dateOfBirth}
                  />

                  <FormInput
                    label="Place of Birth"
                    name="placeOfBirth"
                    value={personalInfo.placeOfBirth}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="City / Municipality (e.g. Quezon City)"
                    error={errors.placeOfBirth}
                  />

                  <FormInput
                    label="Civil Status"
                    name="civilStatus"
                    type="select"
                    value={personalInfo.civilStatus}
                    onChange={handlePersonalInfoChange}
                    required
                    options={[
                      { value: 'Single', label: 'Single' },
                      { value: 'Married', label: 'Married' },
                      { value: 'Widowed', label: 'Widowed' },
                      { value: 'Separated', label: 'Separated' },
                      { value: 'Divorced', label: 'Divorced' },
                    ]}
                  />
                </div>
              </div>

              {/* Section 3: Contact Details */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                  3. Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormInput
                    label="Mobile Contact Number"
                    name="contactNumber"
                    type="tel"
                    value={personalInfo.contactNumber}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="0917XXXXXXX"
                    helperText="For SMS status updates regarding your application"
                    error={errors.contactNumber}
                  />

                  <FormInput
                    label="Email Address (Optional)"
                    name="email"
                    type="email"
                    value={personalInfo.email || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="your.name@example.ph"
                    helperText="For electronic notification and digital receipt"
                    error={errors.email}
                  />
                </div>
              </div>

              {/* Section 4: Residential Address within the Barangay */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem' }}>
                  4. Residential Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                  <FormInput
                    label="House No. / Street / Bldg (Optional)"
                    name="houseStreet"
                    value={personalInfo.houseStreet || ''}
                    onChange={handlePersonalInfoChange}
                    placeholder="e.g. 123 Sampaguita Street"
                  />

                  <FormInput
                    label="Purok / Sitio / Zone"
                    name="purokSitio"
                    value={personalInfo.purokSitio}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="e.g. Purok 4"
                    error={errors.purokSitio}
                  />

                  <FormInput
                    label="Barangay"
                    name="barangay"
                    value={personalInfo.barangay}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="Barangay San Isidro"
                    error={errors.barangay}
                  />

                  <FormInput
                    label="City / Municipality"
                    name="cityMunicipality"
                    value={personalInfo.cityMunicipality}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="Quezon City"
                    error={errors.cityMunicipality}
                  />

                  <FormInput
                    label="Province"
                    name="province"
                    value={personalInfo.province}
                    onChange={handlePersonalInfoChange}
                    required
                    placeholder="Metro Manila"
                    error={errors.province}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENT-SPECIFIC DETAILS */}
          {currentStep === 3 && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Step 3: Document Details for {selectedService?.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                  Specify the purpose of this certification and requirements compliance.
                </p>
              </div>

              {/* SPECIFIC FIELDS FOR BARANGAY CLEARANCE */}
              {selectedDocId === 'clearance' && (
                <div>
                  <FormInput
                    label="Purpose of Request"
                    name="purpose"
                    type="select"
                    value={docDetails.purpose}
                    onChange={handleDocDetailsChange}
                    required
                    placeholder="-- Select Purpose --"
                    options={[
                      { value: 'Local Employment Application', label: 'Local Employment (Private Company)' },
                      { value: 'Government Employment / Civil Service', label: 'Government / Civil Service Employment' },
                      { value: 'Overseas Employment (POEA/DMW)', label: 'Overseas Employment (POEA / DMW)' },
                      { value: 'School Enrollment / Scholarship', label: 'School / University Enrollment or Scholarship' },
                      { value: 'Bank Account Opening', label: 'Bank Account Opening / Proof of Identity' },
                      { value: 'Business Permit Requirement', label: 'Business Permit / Mayor’s Permit Requirement' },
                      { value: 'Postal ID / National ID Requirement', label: 'Government ID Requirement' },
                      { value: 'Other', label: 'Other Purpose (Specify Below)' }
                    ]}
                    error={errors.purpose}
                  />

                  {docDetails.purpose === 'Other' && (
                    <FormInput
                      label="Specify Other Purpose"
                      name="otherPurpose"
                      value={docDetails.otherPurpose || ''}
                      onChange={handleDocDetailsChange}
                      required
                      placeholder="Please specify the legitimate reason for your clearance request"
                      error={errors.otherPurpose}
                    />
                  )}
                </div>
              )}

              {/* SPECIFIC FIELDS FOR CERTIFICATE OF INDIGENCY */}
              {selectedDocId === 'indigency' && (
                <div>
                  <FormInput
                    label="Purpose of Indigency Certification"
                    name="purpose"
                    type="select"
                    value={docDetails.purpose}
                    onChange={handleDocDetailsChange}
                    required
                    placeholder="-- Select Assistance Category --"
                    options={[
                      { value: 'Medical Assistance (Hospital/Clinic)', label: 'Medical Assistance (Hospital bills, surgery, chemo, dialysis)' },
                      { value: 'Financial Assistance (DSWD/AICS)', label: 'Financial Assistance (DSWD / Local Social Welfare Aid)' },
                      { value: 'Educational Assistance / Free Tuition', label: 'Educational Assistance / Scholarship Program' },
                      { value: 'Free Legal Assistance (PAO)', label: 'Public Attorney’s Office (PAO) Legal Representation' },
                      { value: 'Burial / Funeral Assistance', label: 'Burial / Funeral Financial Support' },
                      { value: 'Other', label: 'Other Purpose (Specify Below)' }
                    ]}
                    error={errors.purpose}
                  />

                  {docDetails.purpose === 'Other' && (
                    <FormInput
                      label="Specify Other Purpose"
                      name="otherPurpose"
                      value={docDetails.otherPurpose || ''}
                      onChange={handleDocDetailsChange}
                      required
                      placeholder="Please specify other assistance purpose"
                      error={errors.otherPurpose}
                    />
                  )}

                  <FormInput
                    label="Type of Assistance or Intended Beneficiary / Facility"
                    name="assistanceType"
                    value={docDetails.assistanceType || ''}
                    onChange={handleDocDetailsChange}
                    required
                    placeholder="e.g. Philippine Heart Center / DSWD Crisis Intervention Unit"
                    helperText="Name of hospital, government office, or foundation requesting the Indigency certificate"
                    error={errors.assistanceType}
                  />

                  <FormInput
                    label="Additional Information / Household Remarks (Optional)"
                    name="additionalInfo"
                    type="textarea"
                    value={docDetails.additionalInfo || ''}
                    onChange={handleDocDetailsChange}
                    placeholder="Optional notes regarding family head, patient name, or student beneficiary"
                    rows={3}
                  />
                </div>
              )}

              {/* SPECIFIC FIELDS FOR CERTIFICATE OF RESIDENCY */}
              {selectedDocId === 'residency' && (
                <div>
                  <FormInput
                    label="Purpose of Residency Certificate"
                    name="purpose"
                    type="select"
                    value={docDetails.purpose}
                    onChange={handleDocDetailsChange}
                    required
                    placeholder="-- Select Purpose --"
                    options={[
                      { value: 'Bank Account Opening / Proof of Address', label: 'Bank Account Opening (Proof of Billing/Address)' },
                      { value: 'School Admission / Transfer Credential', label: 'School Admission / Transfer' },
                      { value: 'LTO Driver’s License Application', label: 'LTO Driver’s License Application / Renewal' },
                      { value: 'Utility Connection (Meralco / Manila Water)', label: 'Electric / Water / Internet Utility Application' },
                      { value: 'Comelec Voter Registration', label: 'Voter Registration / Reactivation' },
                      { value: 'Other', label: 'Other Purpose (Specify Below)' }
                    ]}
                    error={errors.purpose}
                  />

                  {docDetails.purpose === 'Other' && (
                    <FormInput
                      label="Specify Other Purpose"
                      name="otherPurpose"
                      value={docDetails.otherPurpose || ''}
                      onChange={handleDocDetailsChange}
                      required
                      placeholder="Please specify purpose"
                      error={errors.otherPurpose}
                    />
                  )}

                  <FormInput
                    label="Estimated Length of Residency in Barangay"
                    name="lengthOfResidency"
                    type="select"
                    value={docDetails.lengthOfResidency || '1 - 3 Years'}
                    onChange={handleDocDetailsChange}
                    required
                    options={[
                      { value: '6 Months to 1 Year', label: '6 Months to 1 Year' },
                      { value: '1 - 3 Years', label: '1 to 3 Years' },
                      { value: '3 - 5 Years', label: '3 to 5 Years' },
                      { value: '5 - 10 Years', label: '5 to 10 Years' },
                      { value: '10+ Years / Since Birth', label: 'More than 10 Years / Since Birth' }
                    ]}
                    error={errors.lengthOfResidency}
                  />
                </div>
              )}

              {/* Requirements Checklist / Info Panel */}
              <div
                style={{
                  marginTop: '1.75rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.75rem',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a' }}>
                    Documentary Verification Checklist
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  The following requirements will be validated by the barangay desk officer prior to document release. Please ensure you have them on hand during claiming:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedService?.requirements.map((req, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                  * Requirements are subject to verification by authorized barangay personnel upon release.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW APPLICATION */}
          {currentStep === 4 && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Step 4: Review Your Application
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                  Please carefully verify all details below before final submission. Click "Edit" on any section to make changes.
                </p>
              </div>

              {/* Review Section 1: Selected Document */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
                    1. Selected Document
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleEditStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Document Type</span>
                    <strong style={{ color: '#0f172a' }}>{selectedService?.title}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Processing Time</span>
                    <strong style={{ color: '#0f172a' }}>{selectedService?.processingTime}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Standard Fee</span>
                    <strong style={{ color: '#16a34a' }}>{selectedService?.standardFee}</strong>
                  </div>
                </div>
              </div>

              {/* Review Section 2: Personal Information */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
                    2. Personal Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleEditStep(2)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Full Legal Name</span>
                    <strong style={{ color: '#0f172a' }}>
                      {personalInfo.firstName} {personalInfo.middleName} {personalInfo.lastName} {personalInfo.suffix}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Date of Birth</span>
                    <strong style={{ color: '#0f172a' }}>{personalInfo.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Place of Birth</span>
                    <strong style={{ color: '#0f172a' }}>{personalInfo.placeOfBirth}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Civil Status</span>
                    <strong style={{ color: '#0f172a' }}>{personalInfo.civilStatus}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Contact Number</span>
                    <strong style={{ color: '#0f172a' }}>{personalInfo.contactNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Email Address</span>
                    <strong style={{ color: '#0f172a' }}>{personalInfo.email || 'None Provided'}</strong>
                  </div>
                </div>
              </div>

              {/* Review Section 3: Residential Address */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
                    3. Residential Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleEditStep(2)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Complete Barangay Address</span>
                  <strong style={{ color: '#0f172a' }}>
                    {[
                      personalInfo.houseStreet,
                      personalInfo.purokSitio,
                      personalInfo.barangay,
                      personalInfo.cityMunicipality,
                      personalInfo.province
                    ].filter(Boolean).join(', ')}
                  </strong>
                </div>
              </div>

              {/* Review Section 4: Application Details */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
                    4. Purpose & Application Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleEditStep(3)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Stated Purpose</span>
                    <strong style={{ color: '#0f172a' }}>
                      {docDetails.purpose === 'Other' ? docDetails.otherPurpose : docDetails.purpose}
                    </strong>
                  </div>
                  {docDetails.assistanceType && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Assistance Type / Agency</span>
                      <strong style={{ color: '#0f172a' }}>{docDetails.assistanceType}</strong>
                    </div>
                  )}
                  {docDetails.lengthOfResidency && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Residency Duration</span>
                      <strong style={{ color: '#0f172a' }}>{docDetails.lengthOfResidency}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Mandatory Government Notice */}
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" style={{ marginTop: '2px', color: '#d97706' }} />
                <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
                  <strong>Important Notice:</strong> Submitting an application does not guarantee approval. Your request will be subject to verification and processing by authorized barangay personnel.
                </div>
              </div>

              {/* Privacy and Truthfulness Confirmation Checkbox */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '0.5rem',
                  border: `1.5px solid ${errors.privacy ? '#ef4444' : '#cbd5e1'}`,
                  marginBottom: '1.5rem'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => {
                      setAgreedToPrivacy(e.target.checked);
                      if (errors.privacy) {
                        setErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.privacy;
                          return updated;
                        });
                      }
                    }}
                    style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
                    I hereby certify that all information provided in this online application is true, accurate, and complete to the best of my knowledge. I understand that falsification of public documents is punishable by law, and I agree to the <strong>Data Privacy Notice</strong> and <strong>Terms of Use</strong>.
                  </span>
                </label>
                {errors.privacy && (
                  <p style={{ margin: '0.5rem 0 0 2rem', fontSize: '0.775rem', color: '#dc2626', fontWeight: 600 }}>
                    {errors.privacy}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {currentStep === 5 && (
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Payment Method</div>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>No delivery — pick up your document at the Barangay Hall after approval.</div>
              </div>

              {/* Fee summary */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.5rem',
                padding: '0.875rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Document Fee</div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{selectedService?.title}</div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>{selectedService?.standardFee}</div>
              </div>

              {/* Payment method selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {/* GCash option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    padding: '1rem',
                    border: `2px solid ${paymentMethod === 'gcash' ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '0.625rem',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'gcash' ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={paymentMethod === 'gcash'}
                    onChange={() => setPaymentMethod('gcash')}
                    style={{ marginTop: '2px', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>💙 GCash</span>
                      <span style={{
                        fontSize: '0.68rem',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        fontWeight: 600
                      }}>Recommended</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Send payment via GCash before your pick-up. Show your GCash receipt at the window.</div>
                  </div>
                </label>

                {/* Pay on pickup option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    padding: '1rem',
                    border: `2px solid ${paymentMethod === 'pay_on_pickup' ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '0.625rem',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'pay_on_pickup' ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pay_on_pickup"
                    checked={paymentMethod === 'pay_on_pickup'}
                    onChange={() => setPaymentMethod('pay_on_pickup')}
                    style={{ marginTop: '2px', accentColor: '#2563eb' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.2rem' }}>🏛️ Pay on Pick-up</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pay cash directly at the Barangay Hall cashier when you claim your document. No advance payment needed.</div>
                  </div>
                </label>
              </div>

              {/* GCash fields — shown only if gcash is selected */}
              {paymentMethod === 'gcash' && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>GCash Payment Details</div>
                  <div style={{
                    padding: '0.625rem 0.875rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.375rem',
                    fontSize: '0.775rem',
                    color: '#1e40af'
                  }}>
                    Send <strong>{selectedService?.standardFee}</strong> to GCash number <strong>0917-XXX-XXXX</strong> (Barangay Hall Cashier). Enter your GCash number and name so staff can verify.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                      Your GCash Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={gcashNumber}
                      onChange={(e) => setGcashNumber(e.target.value)}
                      placeholder="e.g. 09171234567"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: `1.5px solid ${errors.gcashNumber ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.gcashNumber && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{errors.gcashNumber}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                      GCash Account Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={gcashName}
                      onChange={(e) => setGcashName(e.target.value)}
                      placeholder="Full name as registered in GCash"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: `1.5px solid ${errors.gcashName ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.gcashName && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{errors.gcashName}</div>}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                ⚠️ No delivery. Claim your document personally at Window 2, Barangay Hall with 1 valid photo ID.
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION SCREEN */}
          {currentStep === 6 && submittedRecord && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              {/* Success Check Icon */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.25)'
                }}
              >
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Application Submitted Successfully
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '520px', margin: '0 auto 2rem auto', lineHeight: 1.5 }}>
                Your request for <strong>{selectedService?.title}</strong> has been received by the system for verification.
              </p>

              {/* Reference Code Card */}
              <div
                style={{
                  maxWidth: '480px',
                  margin: '0 auto 2rem auto',
                  backgroundColor: '#eff6ff',
                  border: '2px dashed #3b82f6',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#1e40af', fontWeight: 700, letterSpacing: '1px' }}>
                  Official Reference Number
                </span>
                <div
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color: '#1e3a8a',
                    letterSpacing: '1.5px',
                    margin: '0.5rem 0',
                    fontFamily: 'monospace'
                  }}
                >
                  {submittedRecord.referenceNumber}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.875rem' }}>
                  Submitted on: <strong>{submittedRecord.submissionDate}</strong>
                </div>

                {/* Quick Copy Action */}
                <button
                  type="button"
                  onClick={() => handleCopyRef(submittedRecord.referenceNumber)}
                  className="interactive-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 1rem',
                    backgroundColor: copiedRef ? '#16a34a' : '#2563eb',
                    color: '#ffffff',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  aria-label="Copy reference number to clipboard"
                >
                  {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRef ? 'Copied to Clipboard!' : 'Copy Reference Number'}</span>
                </button>
              </div>

              {/* Instructions to track */}
              <div
                style={{
                  maxWidth: '540px',
                  margin: '0 auto 2.5rem auto',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Next Steps:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: '#475569' }}>
                  <li>Take note or screenshot of your Reference Number.</li>
                  <li>Track your request status in real-time through the <strong>Track Application</strong> page.</li>
                  <li>Once your status changes to <strong>"Ready for Claiming"</strong>, bring 1 valid photo ID and your {submittedRecord.payment.method === 'gcash' ? 'GCash receipt' : 'cash payment'} and visit Window 2 at the Barangay Hall.</li>
                </ul>
              </div>

              {/* Official Confirmation Notice */}
              <div
                style={{
                  maxWidth: '540px',
                  margin: '0 auto 2.5rem auto',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem',
                  fontSize: '0.775rem',
                  color: '#166534',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'left'
                }}
              >
                <ShieldCheck className="w-5 h-5" style={{ flexShrink: 0 }} />
                <span><strong>Official Record Logged:</strong> Your application has been officially recorded in the Barangay e-Services Registry. You may now track its status in real-time using your reference number.</span>
              </div>

              {/* Navigation Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('/track', submittedRecord.referenceNumber)}
                  style={{
                    padding: '0.75rem 1.75rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  <Search className="w-4 h-4" />
                  <span>Track Application Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderRadius: '0.5rem',
                    border: '1.5px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

          {/* Form Navigation Footer Buttons (Steps 1 to 5) */}
          {currentStep < 6 && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '1.25rem 2rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.625rem 1.25rem',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '0.5rem',
                      color: '#334155',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel Application
                </button>
              </div>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.5rem',
                    backgroundColor: '#1e40af',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.25)'
                  }}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.625rem', width: '100%', maxWidth: '480px' }}>
                  {submitError && (
                    <div
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#fee2e2',
                        border: '1.5px solid #fecaca',
                        borderRadius: '0.5rem',
                        color: '#991b1b',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        boxSizing: 'border-box'
                      }}
                      role="alert"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626' }} />
                        <span>{submitError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmitApplication}
                        disabled={isSubmitting}
                        className="interactive-btn"
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          flexShrink: 0
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="interactive-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.75rem',
                      backgroundColor: isSubmitting ? '#94a3b8' : '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)'
                    }}
                    aria-label="Confirm and submit application"
                  >
                    {isSubmitting ? (
                      <Spinner size="sm" color="#ffffff" ariaLabel="Submitting application..." />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    <span>{isSubmitting ? 'Submitting Application...' : 'Confirm & Submit Application'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Application Confirmation Modal (Heuristic 3: User Control & Freedom) */}
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel Application Request?"
        message="Are you sure you want to cancel this application? Your entered draft information will be cleared and you will return to the Home page."
        confirmLabel="Yes, Cancel Application"
        cancelLabel="Continue Filling Out Form"
        variant="danger"
        onConfirm={handleConfirmCancelApplication}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export const Apply = ApplyPage;
