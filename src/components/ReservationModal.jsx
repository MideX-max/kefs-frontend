import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import { formatDatePass } from '../utils/constants.js';
import { 
  X, CheckCircle, XCircle, AlertTriangle, User, Calendar, 
  Shield, Download, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReservationModal({ reservation, onClose, onUpdateStatus }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, actions
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    createdAt
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                Reservation Details
              </h2>
              <StatusBadge status={status} size="sm" />
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
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1.75rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.85rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: activeTab === 'overview' ? 'var(--brand-black)' : 'var(--text-muted)',
              borderBottom: activeTab === 'overview' ? '3px solid var(--brand-gold)' : '3px solid transparent',
              transition: 'all 0.15s'
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
              gap: '0.4rem'
            }}
          >
            Identity &amp; Signatures
            {idDocumentUrl && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            style={{
              padding: '0.85rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: activeTab === 'actions' ? 'var(--brand-black)' : 'var(--text-muted)',
              borderBottom: activeTab === 'actions' ? '3px solid var(--brand-gold)' : '3px solid transparent',
              transition: 'all 0.15s'
            }}
          >
            Manager Decision
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
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
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
                  Submitted Identity Document ({idType || 'Government ID'})
                </h4>
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
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                      <a href={idDocumentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                        <ExternalLink size={14} />
                        Open Full Resolution
                      </a>
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
                  Execute Status Change:
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
                    Flag / Require Review
                  </button>

                  <button
                    onClick={() => handleStatusChange('Rejected')}
                    disabled={submitting}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    <XCircle size={15} />
                    Reject Reservation
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
  );
}
