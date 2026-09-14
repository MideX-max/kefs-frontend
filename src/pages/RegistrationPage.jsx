import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext.jsx';
import { api } from '../services/api.js';
import FileUpload from '../components/FileUpload.jsx';
import SignaturePad from '../components/SignaturePad.jsx';
import { ID_TYPES, DEFAULT_FLATS, formatDatePass } from '../utils/constants.js';
import { extractAirbnbBookingDetails, extractSignatureFromDocument } from '../utils/documentParser.js';
import confetti from 'canvas-confetti';
import { 
  User, Calendar, ShieldCheck, PenTool, CheckCircle, ArrowRight, 
  ArrowLeft, Check, Building, Clock, Loader2, Sparkles
} from 'lucide-react';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { submitReservation } = useReservations();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [airbnbFlow, setAirbnbFlow] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => ({
    // Step 1: Guest Details
    guestName: '',
    phone: '',
    email: '',
    guestCount: 1,
    airbnbBooking: false,
    airbnbScreenshotUrl: '',
    airbnbScreenshotName: '',
    airbnbScreenshotPublicId: '',
    airbnbScreenshotResourceType: '',

    // Step 2: Apartment & Dates
    flat: '',
    checkInDate: new Date().toISOString().slice(0, 10),
    checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    checkInTime: '14:00',
    checkOutTime: '11:00',

    // Step 3: Identification
    idType: ID_TYPES[0],
    idNumber: '',
    idDocumentUrl: '',
    idDocumentPublicId: '',
    idDocumentResourceType: '',
    idDocumentName: '',
    idDocumentSize: 0,

    // Step 4: Signature
    signatureUrl: '',
    signaturePublicId: '',
    signatureResourceType: '',
    signatureUploadUrl: '',
    signatureUploadName: '',
    signatureMethod: 'draw', // 'draw' or 'upload'

    // Step 5: Declaration
    confirmedAccuracy: false
  }));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle Airbnb flow activation
  const handleAirbnbChange = (isAirbnb) => {
    handleChange('airbnbBooking', isAirbnb);
    setAirbnbFlow(isAirbnb);
    if (isAirbnb) {
      handleChange('guestCount', 1);
    }
  };

  const handleAirbnbDocUpload = async ({ url, name, publicId, resourceType }) => {
    handleChange('airbnbScreenshotUrl', url);
    handleChange('airbnbScreenshotName', name);
    handleChange('airbnbScreenshotPublicId', publicId || '');
    handleChange('airbnbScreenshotResourceType', resourceType || '');

    if (url) {
      setIsOcrScanning(true);
      setOcrSuccess(false);
      try {
        const parsedDetails = await extractAirbnbBookingDetails(url);

        if (parsedDetails.flat) {
          handleChange('flat', parsedDetails.flat);
        }
        if (parsedDetails.guestName && !formData.guestName) {
          handleChange('guestName', parsedDetails.guestName);
        }
        if (parsedDetails.checkInDate) {
          handleChange('checkInDate', parsedDetails.checkInDate);
        }
        if (parsedDetails.checkOutDate) {
          handleChange('checkOutDate', parsedDetails.checkOutDate);
        }
        setOcrSuccess(true);
      } catch (err) {
        console.warn('Airbnb document extraction error:', err);
      } finally {
        setIsOcrScanning(false);
      }
    }
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.guestName.trim()) newErrors.guestName = 'Full guest name is required.';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (formData.airbnbBooking && !formData.airbnbScreenshotUrl) {
        newErrors.airbnbScreenshotUrl = 'Airbnb booking screenshot is required when booking through Airbnb.';
      }
    }

    // Skip steps 2-4 for Airbnb flow
    if (!airbnbFlow) {
      if (step === 2) {
        if (!formData.flat.trim()) newErrors.flat = 'Please enter the flat/apartment name.';
        if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required.';
        if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required.';
        if (formData.checkInDate && formData.checkOutDate && new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
          newErrors.checkOutDate = 'Check-out date must be after check-in date.';
        }
      }

      if (step === 3) {
        if (!formData.idType) {
          newErrors.idType = 'Identification type is required.';
        }
        if (!formData.idDocumentUrl) {
          newErrors.idDocumentUrl = 'Identification document upload is required.';
        }
      }

      if (step === 4) {
        if (!formData.signatureUrl && !formData.signatureUploadUrl) {
          newErrors.signatureUrl = 'Please provide a signature (draw or upload).';
        }
      }

      if (step === 5) {
        if (!formData.confirmedAccuracy) {
          newErrors.confirmedAccuracy = 'You must confirm the accuracy of the submitted information.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // For Airbnb flow: skip directly to submission after document upload
      if (airbnbFlow && currentStep === 1 && formData.airbnbScreenshotUrl) {
        handleSubmit(new Event('submit'));
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For Airbnb flow, only validate step 1
    if (airbnbFlow) {
      if (!validateStep(1)) return;
    } else {
      if (!validateStep(5)) return;
    }

    setSubmitting(true);
    try {
      // For Airbnb, send parsed/typed flat and signature
      const submissionData = airbnbFlow ? {
        guestName: formData.guestName,
        airbnbBooking: true,
        airbnbScreenshotUrl: formData.airbnbScreenshotUrl,
        airbnbScreenshotName: formData.airbnbScreenshotName,
        airbnbScreenshotPublicId: formData.airbnbScreenshotPublicId,
        airbnbScreenshotResourceType: formData.airbnbScreenshotResourceType,
        guestCount: 1,
        phone: formData.phone || '',
        email: formData.email || '',
        flat: formData.flat || 'Azalea A1',
        checkInDate: formData.checkInDate || new Date().toISOString().slice(0, 10),
        checkOutDate: formData.checkOutDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        checkInTime: formData.checkInTime || '14:00',
        checkOutTime: formData.checkOutTime || '11:00',
        idType: 'Airbnb Verified',
        idNumber: 'Airbnb Verified',
        signatureUrl: formData.signatureUrl || (formData.signatureMethod === 'upload' ? formData.signatureUploadUrl : ''),
        signaturePublicId: formData.signaturePublicId || '',
        signatureResourceType: formData.signatureResourceType || '',
        confirmedAccuracy: true
      } : formData;

      const created = await submitReservation(submissionData);
      
      // Trigger festive confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F3C428', '#111111', '#B88E12']
        });
      } catch (confettiErr) {
        console.warn('Confetti animation skipped:', confettiErr);
      }

      navigate(`/pass/${created.passId}`);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrors({ form: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate nights
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const diff = new Date(formData.checkOutDate) - new Date(formData.checkInDate);
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const normalSteps = [
    { num: 1, title: 'Guest Details', icon: User },
    { num: 2, title: 'Reservation', icon: Calendar },
    { num: 3, title: 'Identification', icon: ShieldCheck },
    { num: 4, title: 'Signature', icon: PenTool },
    { num: 5, title: 'Review', icon: CheckCircle }
  ];

  const airbnbSteps = [
    { num: 1, title: 'Airbnb Document', icon: User }
  ];

  const steps = airbnbFlow ? airbnbSteps : normalSteps;

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '3.5rem 0 5rem' }}>
      <div className="container-narrow">
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: 'var(--brand-gold-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
            KSA CONCIERGE SERVICES
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Guest Registration &amp; Gate Pass Form
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
            Please complete the details below to register your stay and generate your verified estate access gate pass.
          </p>
        </div>

        {/* 5-Step Progress Stepper */}
        <div className="wizard-stepper">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <div 
                key={step.num} 
                className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (isCompleted) setCurrentStep(step.num);
                }}
                style={{ cursor: isCompleted ? 'pointer' : 'default' }}
              >
                <div className="step-circle">
                  {isCompleted ? <Check size={20} strokeWidth={3} /> : step.num}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Main Card Form Container */}
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit}>
            
            {/* ================= STEP 1: GUEST DETAILS ================= */}
            {currentStep === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--border-light)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--brand-black)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                      Section 1: Guest Personal Information
                    </h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Provide the primary guest details for gatehouse clearance.
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Primary Guest Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.guestName ? 'error' : ''}`}
                    placeholder="e.g. Babatunde Adeleke"
                    value={formData.guestName}
                    onChange={(e) => handleChange('guestName', e.target.value)}
                  />
                  {errors.guestName && <span className="form-error">{errors.guestName}</span>}
                </div>

                {!airbnbFlow && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          placeholder="+234 803 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          placeholder="guest@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Number of Guests
                      </label>
                      <select
                        className="form-select"
                        value={formData.guestCount}
                        onChange={(e) => handleChange('guestCount', parseInt(e.target.value, 10))}
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Airbnb Booking Check */}
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.airbnbBooking}
                      onChange={(e) => handleAirbnbChange(e.target.checked)}
                      className="kas-checkbox"
                      style={{ accentColor: 'var(--brand-black)' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--brand-black)' }}>
                      Did you book through Airbnb?
                    </span>
                  </label>
                  
                  {formData.airbnbBooking && (
                    <p style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '0.5rem', lineHeight: '1.4' }}>
                      If you booked through Airbnb, simply upload your booking document and we'll generate your pass automatically. No need to fill out the full registration form.
                    </p>
                  )}
                  
                  {formData.airbnbBooking && (
                    <div style={{ marginTop: '1rem' }}>
                      <FileUpload
                        label="Upload Airbnb Booking Screenshot"
                        hint="Upload a screenshot of your Airbnb booking confirmation page (compulsory)"
                        value={formData.airbnbScreenshotUrl}
                        fileName={formData.airbnbScreenshotName}
                        publicId={formData.airbnbScreenshotPublicId}
                        resourceType={formData.airbnbScreenshotResourceType}
                        kind="booking"
                        onChange={handleAirbnbDocUpload}
                        required={true}
                        accept="image/*"
                      />
                      {errors.airbnbScreenshotUrl && <span className="form-error" style={{ display: 'block', marginTop: '0.5rem' }}>{errors.airbnbScreenshotUrl}</span>}
                      
                      {isOcrScanning && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Loader2 size={20} className="animate-spin" style={{ color: '#0284c7' }} />
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369a1', margin: 0 }}>
                              Scanning document...
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#0284c7', margin: 0 }}>
                              Automatically extracting apartment name from document.
                            </p>
                          </div>
                        </div>
                      )}

                      {formData.airbnbScreenshotUrl && !isOcrScanning && (
                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Sparkles size={18} style={{ color: '#16a34a' }} />
                            <strong style={{ fontSize: '0.9rem', color: '#166534' }}>
                              Details Extracted from Airbnb Document
                            </strong>
                          </div>

                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label" style={{ fontSize: '0.825rem', color: '#14532d' }}>
                              Apartment / Flat Name <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ backgroundColor: '#ffffff', borderColor: '#86efac' }}
                              placeholder="e.g. Azalea D6"
                              value={formData.flat}
                              onChange={(e) => handleChange('flat', e.target.value)}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>
                              Auto-extracted from document (type to adjust if needed)
                            </span>
                          </div>

                          {/* Extracted Stay Dates from Document */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.825rem', color: '#14532d' }}>
                                Check-in Date (on Document) <span className="required">*</span>
                              </label>
                              <input
                                type="date"
                                className="form-input"
                                style={{ backgroundColor: '#ffffff', borderColor: '#86efac' }}
                                value={formData.checkInDate}
                                onChange={(e) => handleChange('checkInDate', e.target.value)}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.825rem', color: '#14532d' }}>
                                Check-out Date (on Document) <span className="required">*</span>
                              </label>
                              <input
                                type="date"
                                className="form-input"
                                style={{ backgroundColor: '#ffffff', borderColor: '#86efac' }}
                                value={formData.checkOutDate}
                                onChange={(e) => handleChange('checkOutDate', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '0.75rem', fontSize: '0.775rem', color: '#166534', fontWeight: 600 }}>
                            📅 Dates verified from uploaded document will be printed on your official Gate Pass ({formatDatePass(formData.checkInDate)} – {formatDatePass(formData.checkOutDate)}).
                          </div>
                        </div>
                      )}

                      {/* Airbnb Digital Signature Capture Section */}
                      <div style={{ marginTop: '1.25rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <PenTool size={18} style={{ color: 'var(--brand-gold-dark)' }} />
                          <strong style={{ fontSize: '0.9rem', color: 'var(--brand-black)' }}>
                            Digital Signature Capture
                          </strong>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                          Sign below or upload a signature image to endorse your Airbnb access pass.
                        </p>

                        {/* Signature Method Selection */}
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="airbnbSignatureMethod"
                                checked={formData.signatureMethod === 'draw'}
                                onChange={() => handleChange('signatureMethod', 'draw')}
                                style={{ accentColor: 'var(--brand-black)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Draw Signature</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="airbnbSignatureMethod"
                                checked={formData.signatureMethod === 'upload'}
                                onChange={() => handleChange('signatureMethod', 'upload')}
                                style={{ accentColor: 'var(--brand-black)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Signature Image</span>
                            </label>
                          </div>
                        </div>

                        {formData.signatureMethod === 'draw' ? (
                          <SignaturePad
                            value={formData.signatureUrl}
                            onChange={(sig) => {
                              handleChange('signatureUrl', sig);
                              handleChange('signaturePublicId', '');
                              handleChange('signatureResourceType', '');
                            }}
                            label="Guest Digital Signature"
                            required={false}
                          />
                        ) : (
                          <FileUpload
                            label="Upload Signature Image"
                            hint="Upload a clear image of your signature"
                            value={formData.signatureUploadUrl}
                            fileName={formData.signatureUploadName}
                            publicId={formData.signaturePublicId}
                            resourceType={formData.signatureResourceType}
                            kind="signature"
                            onChange={({ url, name, publicId, resourceType }) => {
                              handleChange('signatureUploadUrl', url);
                              handleChange('signatureUploadName', name);
                              handleChange('signatureUrl', url);
                              handleChange('signaturePublicId', publicId || '');
                              handleChange('signatureResourceType', resourceType || '');
                            }}
                            required={false}
                            accept="image/*"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= STEP 2: APARTMENT & RESERVATION ================= */}
            {currentStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--border-light)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--brand-black)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                      Section 2: Apartment &amp; Stay Duration
                    </h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Enter the flat/apartment name and stay dates.
                    </span>
                  </div>
                </div>

                {/* Flat / Apartment Name - Manual Entry (Typing Only) */}
                <div className="form-group">
                  <label className="form-label">
                    Flat / Apartment Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.flat ? 'error' : ''}`}
                    placeholder="e.g. Azalea D6"
                    value={formData.flat}
                    onChange={(e) => handleChange('flat', e.target.value)}
                  />
                  {errors.flat && <span className="form-error">{errors.flat}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Check-in Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-input ${errors.checkInDate ? 'error' : ''}`}
                      value={formData.checkInDate}
                      onChange={(e) => handleChange('checkInDate', e.target.value)}
                    />
                    {errors.checkInDate && <span className="form-error">{errors.checkInDate}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Check-out Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-input ${errors.checkOutDate ? 'error' : ''}`}
                      value={formData.checkOutDate}
                      onChange={(e) => handleChange('checkOutDate', e.target.value)}
                    />
                    {errors.checkOutDate && <span className="form-error">{errors.checkOutDate}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.checkInTime}
                      onChange={(e) => handleChange('checkInTime', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.checkOutTime}
                      onChange={(e) => handleChange('checkOutTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* Stay Summary */}
                <div style={{ 
                  backgroundColor: 'var(--brand-gold-light)', 
                  border: '1px solid var(--brand-gold-border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem 1.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Clock size={18} color="var(--brand-gold-dark)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-black)' }}>
                      Total Stay: <strong>{calculateNights()} Night(s)</strong> in <strong>{formData.flat || 'Apartment'}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--brand-gold-dark)', fontWeight: 700 }}>
                    ✅ Ready to Proceed
                  </span>
                </div>
              </div>
            )}

            {/* ================= STEP 3: IDENTIFICATION ================= */}
            {currentStep === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--border-light)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--brand-black)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                      Section 3: Identity Verification Documents
                    </h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Upload valid government-issued identification for estate access authorization.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Identification Type <span className="required">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.idType ? 'error' : ''}`}
                      value={formData.idType}
                      onChange={(e) => handleChange('idType', e.target.value)}
                    >
                      {ID_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.idType && <span className="form-error">{errors.idType}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      ID Document / Slip Number
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.idNumber ? 'error' : ''}`}
                      placeholder="e.g. NIN-89304928114 or Passport No."
                      value={formData.idNumber}
                      onChange={(e) => handleChange('idNumber', e.target.value)}
                    />
                    {errors.idNumber && <span className="form-error">{errors.idNumber}</span>}
                  </div>
                </div>

                {/* File Upload for ID Document */}
                <FileUpload
                  label="Upload Identification Document"
                  hint="Upload NIN Slip, International Passport bio-data page, or Driver's License (compulsory)"
                  value={formData.idDocumentUrl}
                  fileName={formData.idDocumentName}
                  publicId={formData.idDocumentPublicId}
                  resourceType={formData.idDocumentResourceType}
                  kind="id-document"
                  onChange={({ url, name, size, publicId, resourceType }) => {
                    handleChange('idDocumentUrl', url);
                    handleChange('idDocumentName', name);
                    handleChange('idDocumentSize', size);
                    handleChange('idDocumentPublicId', publicId || '');
                    handleChange('idDocumentResourceType', resourceType || '');
                  }}
                  required={true}
                />
                {errors.idDocumentUrl && <span className="form-error" style={{ display: 'block', marginTop: '-1rem', marginBottom: '1rem' }}>{errors.idDocumentUrl}</span>}
              </div>
            )}

            {/* ================= STEP 4: SIGNATURE ================= */}
            {currentStep === 4 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--border-light)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--brand-black)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PenTool size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                      Section 4: Digital Signature Capture
                    </h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Sign below to authorize the reservation and endorse the gate pass.
                    </span>
                  </div>
                </div>

                {/* Signature Method Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-black)', marginBottom: '0.5rem', display: 'block' }}>
                    Signature Method:
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="signatureMethod"
                        checked={formData.signatureMethod === 'draw'}
                        onChange={() => handleChange('signatureMethod', 'draw')}
                        style={{ accentColor: 'var(--brand-black)' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Draw Signature</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="signatureMethod"
                        checked={formData.signatureMethod === 'upload'}
                        onChange={() => handleChange('signatureMethod', 'upload')}
                        style={{ accentColor: 'var(--brand-black)' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Upload Signature Image</span>
                    </label>
                  </div>
                </div>

                {/* Signature Pad or Upload based on selection */}
                {formData.signatureMethod === 'draw' ? (
                  <SignaturePad
                    value={formData.signatureUrl}
                    onChange={(sig) => {
                      handleChange('signatureUrl', sig);
                      handleChange('signaturePublicId', '');
                      handleChange('signatureResourceType', '');
                    }}
                    label="Flat Owner / Guest Representative Signature"
                    required={true}
                  />
                ) : (
                  <FileUpload
                    label="Upload Signature Image"
                    hint="Upload a clear image of your signature"
                    value={formData.signatureUploadUrl}
                    fileName={formData.signatureUploadName}
                    publicId={formData.signaturePublicId}
                    resourceType={formData.signatureResourceType}
                    kind="signature"
                    onChange={({ url, name, publicId, resourceType }) => {
                      handleChange('signatureUploadUrl', url);
                      handleChange('signatureName', name);
                      // Also set signatureUrl for compatibility
                      handleChange('signatureUrl', url);
                      handleChange('signaturePublicId', publicId || '');
                      handleChange('signatureResourceType', resourceType || '');
                    }}
                    required={true}
                    accept="image/*"
                  />
                )}
                
                {errors.signatureUrl && <span className="form-error" style={{ display: 'block', marginTop: '-1rem', marginBottom: '1rem' }}>{errors.signatureUrl}</span>}
              </div>
            )}

            {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
            {currentStep === 5 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--border-light)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--brand-black)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                      Section 5: Review &amp; Confirm Registration
                    </h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Verify all submitted information before final gate pass generation.
                    </span>
                  </div>
                </div>

                {/* Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                  
                  {/* Guest Info */}
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-gold-dark)', display: 'block', marginBottom: '0.5rem' }}>
                      GUEST INFORMATION
                    </span>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.35rem' }}>
                      {formData.guestName}
                    </p>
                    {formData.phone && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                        Phone: <strong>{formData.phone}</strong>
                      </p>
                    )}
                    {formData.email && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                        Email: <strong>{formData.email}</strong>
                      </p>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      Party: <strong>{formData.guestCount} Guest(s)</strong>
                    </p>
                  </div>

                  {/* Stay Info */}
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-gold-dark)', display: 'block', marginBottom: '0.5rem' }}>
                      RESERVATION &amp; FLAT
                    </span>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.35rem' }}>
                      {formData.flat}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      Check-in: <strong>{formatDatePass(formData.checkInDate)} ({formData.checkInTime})</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      Check-out: <strong>{formatDatePass(formData.checkOutDate)} ({formData.checkOutTime})</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      Duration: <strong>{calculateNights()} Night(s)</strong>
                    </p>
                  </div>

                  {/* Documents Info */}
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-gold-dark)', display: 'block', marginBottom: '0.5rem' }}>
                      IDENTIFICATION
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-black)' }}>
                      {formData.idType}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      ID Number: <strong>{formData.idNumber || 'Attached on file'}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem' }}>
                      <CheckCircle size={14} />
                      Document verified &amp; ready
                    </p>
                  </div>

                  {/* Signature Preview */}
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-gold-dark)', display: 'block', marginBottom: '0.5rem' }}>
                      REPRESENTATIVE SIGNATURE
                    </span>
                    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                      {formData.signatureUrl ? (
                        <img src={formData.signatureUrl} alt="Signature preview" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No signature</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Compliance Checkbox */}
                <div style={{ marginBottom: '1.75rem', padding: '1.25rem', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.confirmedAccuracy}
                      onChange={(e) => handleChange('confirmedAccuracy', e.target.checked)}
                      className="kas-checkbox"
                      style={{ marginTop: '3px', accentColor: 'var(--brand-black)' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                      <strong>Declaration:</strong> I hereby certify that the information provided is accurate and that the registered guest(s) will adhere strictly to all estate rules and security regulations of KSA CONCIERGE SERVICES.
                    </span>
                  </label>
                  {errors.confirmedAccuracy && <span className="form-error" style={{ display: 'block', marginTop: '0.5rem' }}>{errors.confirmedAccuracy}</span>}
                </div>

                {errors.form && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                    {errors.form}
                  </div>
                )}

              </div>
            )}

            {/* Navigation Buttons */}
            <div className="wizard-nav">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary btn-lg"
                >
                  {airbnbFlow && currentStep === 1 ? 'Generate Pass from Airbnb Document' : 'Continue to Next Step'}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '220px' }}
                >
                  {submitting ? 'Validating & Issuing Pass...' : 'Submit Registration'}
                  <CheckCircle size={18} />
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
