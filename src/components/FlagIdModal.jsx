import { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

const FLAG_REASONS = [
  'Wrong ID/document',
  'ID number mismatch',
  'Unclear document',
  'Expired document',
  'Suspicious/invalid document',
  'Other'
];

export default function FlagIdModal({ guestName, onClose, onSubmitFlag }) {
  const [selectedReason, setSelectedReason] = useState(FLAG_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? (customReason.trim() ? `Other: ${customReason.trim()}` : 'Other (Unspecified)') : selectedReason;

    setSubmitting(true);
    try {
      await onSubmitFlag(finalReason, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1.5px solid #fef3c7', backgroundColor: '#fffbeb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex' }}>
              <ShieldAlert size={22} color="#d97706" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350f' }}>
                Flag Identity Document
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Guest: <strong>{guestName}</strong>
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', margin: 0 }}>
              Select the primary reason for flagging this document. The flag status and reason will be saved in the database.
            </p>

            {/* Flag Reasons Options */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Flag Reason <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {FLAG_REASONS.map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      border: selectedReason === reason ? '2px solid var(--brand-gold)' : '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: selectedReason === reason ? 'var(--brand-gold-subtle)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: selectedReason === reason ? 700 : 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="flagReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      style={{ accentColor: 'var(--brand-black)' }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason input if "Other" selected */}
            {selectedReason === 'Other' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Specify Custom Reason</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter details of why this document is flagged..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Additional Manager Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Internal Instructions / Notes for Security Gatehouse</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Request physical driver license presentation at entry..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#d97706', borderColor: '#b45309', color: '#ffffff' }}
            >
              <AlertTriangle size={15} />
              Confirm &amp; Flag ID
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
