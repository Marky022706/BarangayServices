import React, { useState } from 'react';
import type { DocumentType } from '../../../types';
import {
  FileCheck,
  HandHeart,
  House,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  Info,
  Building2
} from '../../../components/Icons';

interface HelpSupportProps {
  onNavigate: (path: string, param?: string) => void;
  onApplyService?: (serviceId: DocumentType) => void;
}

interface FaqItem {
  id: string;
  category: 'applying' | 'requirements' | 'tracking' | 'claiming' | 'troubleshooting';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'applying',
    question: 'How do I request a Barangay Clearance or Certificate online?',
    answer:
      'Click "Apply Now" in the navigation bar or select a service card on the Home page. Complete the 5-step guided form: (1) Select your document, (2) Enter your personal information and residential address, (3) Specify the purpose of your request, (4) Review all entered details, and (5) Choose your payment method (GCash or Pay on Pick-up) and submit.'
  },
  {
    id: 'faq-2',
    category: 'requirements',
    question: 'What valid IDs are accepted when claiming my barangay document?',
    answer:
      'You must present at least one (1) valid government-issued photo ID bearing your residential address in Barangay San Isidro (e.g., PhilSys National ID, Passport, Driver’s License, Voter’s ID/Certification, Postal ID, UMID, Senior Citizen ID, or School/Company ID supported by a Purok Endorsement).'
  },
  {
    id: 'faq-3',
    category: 'requirements',
    question: 'How much are the processing fees for each document?',
    answer:
      'Certificate of Indigency is FREE of charge (₱0.00) pursuant to Barangay Ordinance. Certificate of Residency costs ₱50.00. Barangay Clearance costs ₱50.00 (or FREE for First-Time Jobseekers covered under Republic Act No. 11261 upon presenting a signed Oath of Undertaking).'
  },
  {
    id: 'faq-4',
    category: 'tracking',
    question: 'How can I check the status of my submitted application?',
    answer:
      'Go to the "Track Application" page and enter your Reference Number (e.g., BRGY-2026-CLR-0001). If you submitted your application on the same browser/device, your recent reference numbers are automatically listed on the Track page for one-click lookup.'
  },
  {
    id: 'faq-5',
    category: 'tracking',
    question: 'What do the different application status badges mean?',
    answer:
      '• Pending Review: Your online form was received and awaits initial desk officer intake.\n• Under Verification: Barangay staff are verifying your residency and Lupon/community standing.\n• Approved: Your application passed verification and is queued for printing and the Punong Barangay’s signature.\n• Ready for Claiming: Your signed and sealed certificate is ready for pick-up at Barangay Hall Window 2.\n• Successful: You have physically claimed your document.\n• Rejected: Your application could not be processed due to incomplete/inaccurate details (see the rejection reason on the Track page).'
  },
  {
    id: 'faq-6',
    category: 'claiming',
    question: 'Can a family member or representative claim the document on my behalf?',
    answer:
      'For Barangay Clearance, personal appearance is strictly required for identity verification and thumbmarking/signature. For Certificate of Indigency or Residency (e.g., when the resident is hospitalized or bedridden), an immediate family member may claim the document by presenting a signed Authorization Letter, the applicant’s valid ID, and the representative’s valid ID.'
  },
  {
    id: 'faq-7',
    category: 'troubleshooting',
    question: 'I made a mistake or typo in my submitted application. Can I edit it?',
    answer:
      'Once an application is submitted and assigned an official Reference Number, it is locked to preserve audit integrity during records verification. If you notice a spelling error before claiming, please inform the Desk Officer at Window 2 upon pick-up or call the Barangay Hall hotline with your Reference Number so staff can update or cancel your record.'
  },
  {
    id: 'faq-8',
    category: 'troubleshooting',
    question: 'What should I do if I lost or forgot my Reference Number?',
    answer:
      'First, visit the "Track Application" page on the same device you used to apply—your recent reference numbers are saved under "Recent Applications on This Device". If you applied on another device, visit or call the Barangay Hall Desk Officer and provide your full legal name and date of birth so staff can look up your record.'
  },
  {
    id: 'faq-9',
    category: 'troubleshooting',
    question: 'My application status says "Rejected". What should I do next?',
    answer:
      'Track your reference number on the "Track Application" page to read the specific reason provided by the Barangay Officer (for example, unverified address or mismatched details). You may submit a new online application with the corrected information or visit Window 2 with your supporting documents.'
  }
];

export const HelpSupport: React.FC<HelpSupportProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'applying', label: 'Applying Online' },
    { id: 'requirements', label: 'Requirements & Fees' },
    { id: 'tracking', label: 'Status Tracking' },
    { id: 'claiming', label: 'Document Claiming' },
    { id: 'troubleshooting', label: 'Common Issues & Help' }
  ];

  const documentGuides = [
    {
      id: 'clearance' as DocumentType,
      title: 'Barangay Clearance',
      icon: <FileCheck className="w-6 h-6" style={{ color: '#2563eb' }} />,
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      fee: '₱50.00 (Free for First-Time Jobseekers under RA 11261)',
      processingTime: '1 – 2 Working Days',
      description: 'Certifies that you are a law-abiding resident of the barangay with no pending administrative or Lupon Tagapamayapa case.',
      requirements: [
        '1 Valid Government-Issued Photo ID showing Barangay San Isidro address',
        'Community Tax Certificate (Cedula) for the current year',
        'Purok Leader Endorsement Slip (if ID does not reflect current barangay address)',
        'Personal appearance at Window 2 upon claiming'
      ]
    },
    {
      id: 'indigency' as DocumentType,
      title: 'Certificate of Indigency',
      icon: <HandHeart className="w-6 h-6" style={{ color: '#059669' }} />,
      badgeBg: '#ecfdf5',
      badgeColor: '#047857',
      fee: 'Free (₱0.00)',
      processingTime: 'Same Day – 1 Working Day',
      description: 'Attests to your household’s low-income status to avail of medical, hospital, educational, burial, or DSWD/PAO assistance.',
      requirements: [
        '1 Valid Photo ID of the applicant or immediate family representative',
        'Supporting document for the request (e.g., Hospital Abstract, Medical Prescription, School Assessment, or Social Case Study)',
        'Name of the agency, hospital, or institution where the certificate will be presented'
      ]
    },
    {
      id: 'residency' as DocumentType,
      title: 'Certificate of Residency',
      icon: <House className="w-6 h-6" style={{ color: '#d97706' }} />,
      badgeBg: '#fffbeb',
      badgeColor: '#b45309',
      fee: '₱50.00',
      processingTime: '1 Working Day',
      description: 'Confirms your bona fide residence and length of stay in the barangay for bank accounts, utilities, LTO, or school admission.',
      requirements: [
        '1 Valid Government-Issued Photo ID',
        'Proof of billing or residence (e.g., Meralco/Water bill, Lease Contract, or Purok Certification)',
        'Minimum of six (6) months continuous residency in Barangay San Isidro'
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 120px)', padding: '2.5rem 1.5rem 4.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* Hero Header */}
        <div
          style={{
            backgroundColor: '#0f172a',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            color: '#ffffff',
            marginBottom: '2.5rem',
            borderBottom: '4px solid #2563eb',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
          }}
        >
          <div style={{ maxWidth: '720px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#93c5fd',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '1rem'
              }}
            >
              <Info className="w-4 h-4" />
              <span>Citizen Help &amp; Documentation Center</span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem 0', lineHeight: 1.2 }}>
              How Can We Help You Today?
            </h1>
            <p style={{ fontSize: '0.975rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Find official documentary requirements, step-by-step instructions for online filing and claiming at Window 2, solutions to common application issues, and verified Barangay Hall contact channels.
            </p>

            {/* Quick Search Input */}
            <div style={{ position: 'relative', maxWidth: '520px' }}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help topics (e.g., valid ID, fee, lost reference number, claiming)..."
                aria-label="Search help and frequently asked questions"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  borderRadius: '0.625rem',
                  border: '2px solid #334155',
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  fontSize: '0.925rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search
                className="w-5 h-5"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 1: Step-by-Step Citizen Workflow */}
        <section style={{ marginBottom: '3rem' }} aria-labelledby="workflow-heading">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 id="workflow-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              How to Request &amp; Claim Your Barangay Document
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Follow these four simple steps from online filing to in-person release at Barangay Hall Window 2.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1rem'
            }}
          >
            {[
              {
                step: 'Step 1',
                title: 'Select Service & Fill Out Form',
                desc: 'Choose Barangay Clearance, Indigency, or Residency. Enter your complete legal name, birth details, and barangay address accurately.',
                icon: <FileCheck className="w-5 h-5" style={{ color: '#2563eb' }} />
              },
              {
                step: 'Step 2',
                title: 'Review & Save Reference Code',
                desc: 'Verify your entries on the Review screen and submit. Copy or screenshot your unique Reference Number (e.g., BRGY-2026-CLR-0001).',
                icon: <ShieldCheck className="w-5 h-5" style={{ color: '#4f46e5' }} />
              },
              {
                step: 'Step 3',
                title: 'Track Verification Status',
                desc: 'Use the Track Application page to monitor your request as staff verify your records and the Punong Barangay signs your certificate.',
                icon: <Clock className="w-5 h-5" style={{ color: '#d97706' }} />
              },
              {
                step: 'Step 4',
                title: 'Claim at Barangay Window 2',
                desc: 'Once status is "Ready for Claiming", visit Window 2 (Mon–Fri, 8:00 AM – 5:00 PM) with 1 valid government photo ID and payment/receipt.',
                icon: <CheckCircle2 className="w-5 h-5" style={{ color: '#16a34a' }} />
              }
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#1e40af',
                      backgroundColor: '#dbeafe',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px'
                    }}
                  >
                    {item.step}
                  </span>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.45rem 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Official Document Requirements & Fees */}
        <section style={{ marginBottom: '3rem' }} aria-labelledby="requirements-heading">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 id="requirements-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              Official Document Requirements, Fees &amp; Processing Time
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Prepare these documentary requirements to present at Window 2 when claiming your certificate.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {documentGuides.map((doc) => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.875rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '0.625rem',
                        backgroundColor: doc.badgeBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {doc.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {doc.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: doc.badgeColor, fontWeight: 700 }}>
                        Turnaround: {doc.processingTime}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, marginBottom: '1rem' }}>
                    {doc.description}
                  </p>

                  <div
                    style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.82rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Standard Fee: </span>
                    <strong style={{ color: '#0f172a' }}>{doc.fee}</strong>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Required Upon Claiming:
                  </div>
                  <ul style={{ margin: '0 0 1.25rem 0', paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#334155', lineHeight: 1.55 }}>
                    {doc.requirements.map((req, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/apply', doc.id)}
                  className="interactive-btn"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>Apply for {doc.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Frequently Asked Questions (FAQs) & Troubleshooting */}
        <section style={{ marginBottom: '3rem' }} aria-labelledby="faq-heading">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 id="faq-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                Frequently Asked Questions &amp; Troubleshooting
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Clear answers to common questions about online requests, requirements, and resolving errors.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }} role="tablist" aria-label="FAQ Categories">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '9999px',
                      border: `1.5px solid ${active ? '#2563eb' : '#cbd5e1'}`,
                      backgroundColor: active ? '#2563eb' : '#ffffff',
                      color: active ? '#ffffff' : '#334155',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.75rem',
                      border: `1.5px solid ${isOpen ? '#93c5fd' : '#e2e8f0'}`,
                      overflow: 'hidden',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      style={{
                        width: '100%',
                        padding: '1.1rem 1.35rem',
                        backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {faq.question}
                      </span>
                      <span
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          flexShrink: 0,
                          lineHeight: 1
                        }}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '0 1.35rem 1.25rem 1.35rem',
                          fontSize: '0.88rem',
                          color: '#334155',
                          lineHeight: 1.65,
                          whiteSpace: 'pre-line',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '0.85rem'
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center'
                }}
              >
                <AlertCircle className="w-8 h-8" style={{ color: '#94a3b8', margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  No matching help articles found
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                  Try clearing your search filter or browse all FAQ categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.5rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Show All FAQs
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Verified Barangay Contact & Assistance Channels */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '1.5px solid #cbd5e1',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)'
          }}
          aria-labelledby="contact-heading"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                <Building2 className="w-4 h-4" />
                <span>Verified Barangay Assistance Desk</span>
              </div>
              <h2 id="contact-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Need Direct Staff Assistance?
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                If you need help correcting a submitted application, verifying residency requirements, or checking a delayed request, please reach out to our Barangay Public Assistance &amp; Clearances Desk during official office hours.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('/apply')}
                  className="interactive-btn"
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>Apply for a Document</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/track')}
                  className="interactive-btn"
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    borderRadius: '0.5rem',
                    border: '1.5px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Search className="w-4 h-4" />
                  <span>Track Existing Application</span>
                </button>
              </div>
            </div>

            <div
              style={{
                flex: '1 1 340px',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin className="w-5 h-5" style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Barangay San Isidro Government Hall</strong>
                  <span style={{ color: '#475569' }}>Window 2 (Clearances &amp; Certifications Section), Main Street, Quezon City, Metro Manila</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Phone className="w-5 h-5" style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Official Telephone &amp; SMS Hotline</strong>
                  <span style={{ color: '#475569' }}>(02) 8000-0000 / 0917-000-0000</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Mail className="w-5 h-5" style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Official Helpdesk Email</strong>
                  <span style={{ color: '#475569' }}>contact@barangay-sample.gov.ph</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Clock className="w-5 h-5" style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Office &amp; Claiming Hours</strong>
                  <span style={{ color: '#475569' }}>Monday – Friday, 8:00 AM – 5:00 PM (No Noon Break)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};



export const HelpSupportPage = HelpSupport;
