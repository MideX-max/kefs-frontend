import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import FlagIdModal from './FlagIdModal.jsx';
import { formatDatePass } from '../utils/constants.js';
import { 
  X, CheckCircle, XCircle, AlertTriangle, User, Calendar, 
  Shield, Download, ExternalLink, Flag, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReservationModal({ reservation, onClose, onUpdateStatus, onReviewExtension, onVerifyId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, actions
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);

  if (!reservation) return null;

  const {
    id,
    passId,
    guestName,
    email,
    phone,
    guestCount,
    purpose,
    flat,
    checkInDate,
    checkOutDate,
    checkInTime,
    checkOutTime,
    idType,
    idNumber,
    idDocumentName,
    idDocumentUrl,
    signatureUrl,
    managerSignatureUrl,
    status,
    autoApproved,
    verificationNotes,
    createdAt,
    extensionRequest,
    idVerification = { status: 'pending', flagReason: '', flaggedAt: '', flaggedBy: '', notes: '' }
  } = reservation;

  const handleStatusChange = async (newStatus) => {
    setSubmitting(true);
    try {
      await onUpdateStatus(id, newStatus, actionNotes || `Status updated to ${newStatus} by Facility Manager.`);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyIdAction = async (action, flagReason = '', notes = '') => {
    if (!onVerifyId) return;
    setSubmitting(true);
    try {
      await onVerifyId(id, { action, flagReason, notes: notes || actionNotes });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewExtension = async (action) => {
    if (!onReviewExtension) return;
    setSubmitting(true);
    try {
      await onReviewExtension(id, action, actionNotes || `Stay extension ${action}d by Facility Manager.`);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
          
          {/* Header */}
          <div className="modal-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                  Reservation Details
                </h2>
                <StatusBadge status={status} size="sm" />
                {idVerification.status === 'flagged' && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} />
                    ID Flagged
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Pass ID: <strong style={{ color: 'var(--brand-black)', fontFamily: 'monospace' }}>{passId}</strong> • Submitted: {new Date(createdAt).toLocaleString()}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1.75rem', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '0.85rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: activeTab === 'overview' ? 'var(--brand-black)' : 'var(--text-muted)',
                borderBottom: activeTab === 'overview' ? '3px solid var(--brand-gold)' : '3px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
            >
              Overview &amp; Stay
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                padding: '0.85rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: activeTab === 'documents' ? 'var(--brand-black)' : 'var(--text-muted)',
                borderBottom: activeTab === 'documents' ? '3px solid var(--brand-gold)' : '3px solid transparent',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              Identity &amp; Signatures
              {idDocumentUrl && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: idVerification.status === 'flagged' ? '#f59e0b' : '#10b981' }}></span>}
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              style={{
                padding: '0.85rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: activeTab === 'actions' ? 'var(--brand-black)' : 'var(--text-muted)',
                borderBottom: activeTab === 'actions' ? '3px solid var(--brand-gold)' : '3px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
            >
              Manager Decision
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            
            {/* Persistent ID Flagged Banner if ID is flagged */}
            {idVerification.status === 'flagged' && (
              <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <ShieldAlert size={18} color="#d97706" />
                  <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>
                    Identity Document Flagged by Facility Manager
                  </strong>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                  <strong>Flag Reason:</strong> {idVerification.flagReason || 'Unspecified document issue'}
                  {idVerification.flaggedBy && <span> &bull; <strong>Flagged By:</strong> {idVerification.flaggedBy}</span>}
                  {idVerification.flaggedAt && <span> &bull; {new Date(idVerification.flaggedAt).toLocaleString()}</span>}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Pending Stay Extension Alert Banner */}
                {extensionRequest?.status === 'pending' && (
                  <div style={{ padding: '1.25rem', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} color="#d97706" />
                        <strong style={{ color: '#92400e', fontSize: '1rem' }}>
                          Stay Extension Request Pending Verification
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '10px' }}>
                        Action Required
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#78350f', margin: '0 0 1rem 0' }}>
                      Guest has requested to extend their checkout from <strong>{formatDatePass(checkOutDate)}</strong> to <strong>{formatDatePass(extensionRequest.requestedCheckOutDate)}</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleReviewExtension('approve')}
                        disabled={submitting}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={15} />
                        Approve Extension
                      </button>
                      <button
                        onClick={() => handleReviewExtension('reject')}
                        disabled={submitting}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <XCircle size={15} />
                        Reject Extension
                      </button>
                    </div>
                  </div>
                )}

                {/* Guest & Contact Card */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-black)', letterSpacing: '0.04em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} color="var(--brand-gold-dark)" />
                    Guest Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>FULL NAME</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--brand-black)' }}>{guestName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PHONE NUMBER</span>
                      <strong>{phone || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>EMAIL ADDRESS</span>
                      <strong>{email || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>NUMBER OF GUESTS</span>
                      <strong>{guestCount} Guest(s)</strong>
                    </div>
                  </div>
                </div>

                {/* Apartment & Dates Card */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-black)', letterSpacing: '0.04em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="var(--brand-gold-dark)" />
                    Stay &amp; Flat Allocation
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>ASSIGNED FLAT</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--brand-black)' }}>{flat}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>CHECK-IN</span>
                      <strong>{formatDatePass(checkInDate)} ({checkInTime})</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>CHECK-OUT</span>
                      <strong>{formatDatePass(checkOutDate)} ({checkOutTime})</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PURPOSE OF VISIT</span>
                      <strong>{purpose || 'Apartment Stay'}</strong>
                    </div>
                  </div>
                </div>

                {/* Automated Validation Log */}
                <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-black)' }}>
                    <Shield size={15} color={autoApproved ? '#10b981' : '#f59e0b'} />
                    Validation Audit Trail
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                    {verificationNotes || "Automated check confirmed that required fields and identification were submitted."}
                  </p>
                </div>

              </div>
            )}

            {activeTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* ID Document Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-black)' }}>
                      Submitted Identity Document ({idType || 'Government ID'})
                    </h4>
                    {idVerification.status === 'flagged' ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px' }}>
                        Flagged: {idVerification.flagReason}
                      </span>
                    ) : idVerification.status === 'approved' ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '10px' }}>
                        ID Approved
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '10px' }}>
                        ID Verification Pending
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Document ID: {idNumber || 'N/A'} • File: {idDocumentName || 'id_attachment'}
                  </p>
                  
                  {idDocumentUrl ? (
                    <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                      <img 
                        src={idDocumentUrl} 
                        alt="Identification Preview" 
                        style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '4px' }}
                      />
                      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <a href={idDocumentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          <ExternalLink size={14} />
                          Open Full Resolution
                        </a>

                        {/* Quick ID Actions */}
                        {onVerifyId && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyIdAction('approve')}
                              disabled={submitting}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#10b981', borderColor: '#059669' }}
                            >
                              <ShieldCheck size={14} />
                              Approve ID
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowFlagModal(true)}
                              disabled={submitting}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#d97706', borderColor: '#fde68a', backgroundColor: '#fffbeb' }}
                            >
                              <Flag size={14} />
                              Flag ID
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                      No ID document uploaded with this reservation.
                    </div>
                  )}
                </div>

                {/* Signature Inspection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.25rem' }}>
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: '#ffffff' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                      GUEST / FLAT OWNER SIGNATURE
                    </span>
                    <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      {signatureUrl ? (
                        <img src={signatureUrl} alt="Guest signature" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No signature submitted</span>
                      )}
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: '#ffffff' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                      FACILITY MANAGER SIGNATURE
                    </span>
                    <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      <img src={managerSignatureUrl} alt="Manager signature" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'actions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* ID Verification Dedicated Control Card */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-black)', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color="var(--brand-gold-dark)" />
                    Facility Manager ID Verification Workflow
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)', marginBottom: '1rem' }}>
                    Manually review guest identification. Select one of the three verification actions below:
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleVerifyIdAction('approve')}
                      disabled={submitting}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#10b981', borderColor: '#059669' }}
                    >
                      <CheckCircle size={15} />
                      Approve ID Document
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowFlagModal(true)}
                      disabled={submitting}
                      className="btn btn-outline-gold btn-sm"
                      style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}
                    >
                      <Flag size={15} />
                      Flag ID Document
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyIdAction('reject', 'Identity Document Invalid/Rejected')}
                      disabled={submitting}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    >
                      <XCircle size={15} />
                      Reject Registration
                    </button>
                  </div>
                </div>

                {/* Stay extension request action banner */}
                {extensionRequest?.status === 'pending' && (
                  <div style={{ padding: '1.25rem', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={18} color="#d97706" />
                      <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>
                        Stay Extension Request Pending Facility Manager Verification
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#78350f', margin: '0 0 1rem 0' }}>
                      Guest requested to extend check-out to: <strong>{formatDatePass(extensionRequest.requestedCheckOutDate)}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleReviewExtension('approve')}
                        disabled={submitting}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={15} />
                        Approve Stay Extension
                      </button>
                      <button
                        onClick={() => handleReviewExtension('reject')}
                        disabled={submitting}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <XCircle size={15} />
                        Reject Extension
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Manager Verification Notes / Decision Reason
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter any internal notes or instructions for security gatehouse..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-black)' }}>
                    Other Status Actions:
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleStatusChange('Approved')}
                      disabled={submitting}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle size={15} />
                      Approve Reservation
                    </button>

                    <button
                      onClick={() => handleStatusChange('Pending Review')}
                      disabled={submitting}
                      className="btn btn-outline-gold btn-sm"
                    >
                      <AlertTriangle size={15} />
                      Require Review
                    </button>

                    <button
                      onClick={() => handleStatusChange('Expired')}
                      disabled={submitting}
                      className="btn btn-outline btn-sm"
                    >
                      Mark as Expired
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/pass/${passId}`);
              }}
              className="btn btn-dark btn-sm"
            >
              <Download size={15} color="var(--brand-gold)" />
              View Official Gate Pass
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Flag ID Modal Dialog */}
      {showFlagModal && (
        <FlagIdModal
          guestName={guestName}
          onClose={() => setShowFlagModal(false)}
          onSubmitFlag={(reason, notes) => handleVerifyIdAction('flag', reason, notes)}
        />
      )}
    </>
  );
}
