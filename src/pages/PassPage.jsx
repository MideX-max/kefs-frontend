import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext.jsx';
import OfficialPassCard from '../components/OfficialPassCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { generatePassPDF } from '../utils/pdfGenerator.js';
import { formatDatePass } from '../utils/constants.js';
import { 
  Download, Printer, ArrowLeft, ShieldCheck, AlertTriangle, CalendarPlus
} from 'lucide-react';

export default function PassPage() {
  const { passId } = useParams();
  const { getReservationById, extendStay } = useReservations();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [extending, setExtending] = useState(false);
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [newCheckOutTime, setNewCheckOutTime] = useState('');
  const [extendError, setExtendError] = useState('');

  const passCardRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (!passId) return;
      setLoading(true);
      try {
        const data = await getReservationById(passId);
        setReservation(data);
        if (data?.checkOutTime) {
          setNewCheckOutTime(data.checkOutTime);
        }
      } catch (err) {
        console.error('Failed to load pass:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [passId, getReservationById]);

  const handleDownloadPDF = async () => {
    if (!reservation) return;
    setDownloading(true);
    try {
      const filename = `KEFFI_APARTMENT_PASS_${reservation.passId}.pdf`;
      await generatePassPDF('kas-official-guest-pass', filename);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF. Please try using the Print button.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getMinExtensionDate = () => {
    if (!reservation?.checkOutDate) return '';
    try {
      const [y, m, d] = reservation.checkOutDate.split('-').map(Number);
      const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
      return nextDay.toISOString().slice(0, 10);
    } catch {
      return reservation.checkOutDate;
    }
  };

  const handleExtendStay = async () => {
    if (!newCheckOutDate) {
      setExtendError('Please select a new check-out date.');
      return;
    }

    if (newCheckOutDate <= reservation.checkOutDate) {
      setExtendError(`New check-out date must be after current check-out date (${reservation.checkOutDate}).`);
      return;
    }

    setExtending(true);
    setExtendError('');
    
    try {
      const selectedTime = newCheckOutTime || reservation.checkOutTime || '11:00';
      const updatedReservation = await extendStay(
        reservation.id || reservation.passId, 
        newCheckOutDate, 
        selectedTime
      );
      if (updatedReservation) {
        setReservation(updatedReservation);
        if (updatedReservation.checkOutTime) {
          setNewCheckOutTime(updatedReservation.checkOutTime);
        }
      }
      setShowExtendForm(false);
      setNewCheckOutDate('');
    } catch (err) {
      setExtendError(err.message || 'Failed to request stay extension. Please try again.');
    } finally {
      setExtending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--brand-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>Retrieving Official Gate Pass...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Validating pass security credentials</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface)', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.75rem' }}>
            Gate Pass Not Found
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            No reservation or gate pass was found matching ID: <strong>{passId}</strong>. Please ensure the pass ID is correct or contact the facility manager.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/status" className="btn btn-outline">
              Try Another ID
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register New Guest
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = reservation.status === 'Approved' || reservation.status === 'Active' || reservation.status === 'Upcoming';
  const isPending = reservation.status === 'Pending Review';
  const isExpired = reservation.status === 'Expired';
  const canExtend = reservation.status !== 'Rejected' && reservation.status !== 'Pending Review';

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '3.5rem 0 5rem', overflowX: 'hidden' }}>
      <div className="container" style={{ overflowX: 'hidden' }}>
        
        {/* Back Link */}
        <div className="no-print" style={{ marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-black)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} />
            Back to Estate Home
          </Link>
        </div>

        {/* Confirmation Status Banner */}
        <div className="no-print" style={{
          backgroundColor: isApproved ? '#f0fdf4' : (isPending ? '#fffbeb' : (isExpired ? '#f3f4f6' : '#fef2f2')),
          border: `1.5px solid ${isApproved ? '#bbf7d0' : (isPending ? '#fde68a' : '#d1d5db')}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.15rem, 1rem + 1.2vw, 1.45rem)', fontWeight: 800, color: 'var(--brand-black)', minWidth: 0 }}>
                {isApproved ? 'Reservation Approved & Verified' : (isPending ? 'Reservation Requires Management Review' : `Reservation Status: ${reservation.status}`)}
              </h1>
              <StatusBadge status={reservation.status} size="md" />
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
              Guest: <strong>{reservation.guestName}</strong> • Suite: <strong>{reservation.flat}</strong> • Stay: <strong>{formatDatePass(reservation.checkInDate)} ({reservation.checkInTime || '14:00'}) &rarr; {formatDatePass(reservation.checkOutDate)} ({reservation.checkOutTime || '11:00'})</strong>
              {reservation.verificationNotes && reservation.verificationNotes.includes('extended') && (
                <span style={{ marginLeft: '0.5rem', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>
                  (Extended)
                </span>
              )}
            </p>

            {reservation.extensionRequest?.status === 'pending' && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', color: '#92400e', fontSize: '0.85rem' }}>
                <strong>Stay Extension Pending:</strong> Request to extend stay until <strong>{formatDatePass(reservation.extensionRequest.requestedCheckOutDate)} ({reservation.extensionRequest.requestedCheckOutTime || reservation.checkOutTime || '11:00'})</strong> is awaiting Facility Manager verification.
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="pass-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn btn-primary"
            >
              <Download size={18} />
              {downloading ? 'Exporting PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-dark"
            >
              <Printer size={18} color="var(--brand-gold)" />
              Print Pass
            </button>

            {canExtend && (
              <button
                onClick={() => setShowExtendForm(!showExtendForm)}
                className="btn btn-outline"
                style={{ borderColor: 'var(--brand-gold-dark)', color: 'var(--brand-black)' }}
              >
                <CalendarPlus size={18} color="var(--brand-gold-dark)" />
                {showExtendForm ? 'Close Extension' : 'Extend Stay'}
              </button>
            )}
          </div>
        </div>

        {/* Extend Stay Panel */}
        {showExtendForm && canExtend && (
          <div className="no-print card" style={{
            padding: '2rem',
            marginBottom: '2.5rem',
            backgroundColor: '#f8fafc',
            border: '2px solid var(--brand-gold)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--brand-black)',
                color: 'var(--brand-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarPlus size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-black)', margin: 0 }}>
                  Extend Your Guest Stay at Keffi Pass
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Current Check-out: <strong>{formatDatePass(reservation.checkOutDate)} ({reservation.checkOutTime || '11:00'})</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
                  Select New Check-Out Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={newCheckOutDate}
                  onChange={(e) => setNewCheckOutDate(e.target.value)}
                  min={getMinExtensionDate()}
                  style={{ width: '100%', height: '44px', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
                  Select New Check-Out Time
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={newCheckOutTime || reservation.checkOutTime || '11:00'}
                  onChange={(e) => setNewCheckOutTime(e.target.value)}
                  style={{ width: '100%', height: '44px', fontWeight: 600 }}
                />
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                  Quick Add Options:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[1, 3, 7].map(days => {
                    const [y, m, d] = (reservation.checkOutDate || '').split('-').map(Number);
                    const target = new Date(Date.UTC(y, m - 1, d + days));
                    const targetStr = target.toISOString().slice(0, 10);
                    const isSelected = newCheckOutDate === targetStr;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setNewCheckOutDate(targetStr)}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', minHeight: 'auto' }}
                      >
                        +{days} {days === 1 ? 'Day' : 'Days'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {extendError && (
              <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} />
                <span>{extendError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setShowExtendForm(false); setNewCheckOutDate(''); setNewCheckOutTime(reservation.checkOutTime || '11:00'); setExtendError(''); }}
                className="btn btn-outline"
                disabled={extending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtendStay}
                disabled={extending || !newCheckOutDate}
                className="btn btn-primary"
              >
                {extending ? 'Updating Pass...' : 'Confirm Stay Extension'}
              </button>
            </div>
          </div>
        )}

        {/* The Official Gate Pass Replica Card */}
        <div style={{ marginBottom: '3rem' }}>
          <OfficialPassCard ref={passCardRef} reservation={reservation} />
        </div>

        {/* Security & Gate Entry Instructions */}
        <div className="no-print" style={{ maxWidth: '740px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1.5px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-black)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck size={20} color="var(--brand-gold-dark)" />
              Estate Gate Entry Instructions
            </h3>
            
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              <li>
                <strong>Gatehouse Presentation:</strong> Please present this official pass on your mobile device or as a printed copy to security officers at the main gate.
              </li>
              <li>
                <strong>Verification:</strong> Security will verify the <strong>Pass ID ({reservation.passId})</strong> and match with the physical identification on file.
              </li>
              <li>
                <strong>Validity:</strong> Pass is active strictly from <strong>{formatDatePass(reservation.checkInDate)} ({reservation.checkInTime || '14:00'})</strong> to <strong>{formatDatePass(reservation.checkOutDate)} ({reservation.checkOutTime || '11:00'})</strong>.
              </li>
              <li>
                <strong>Support:</strong> If you experience any delay, contact the Facility Manager at <strong>+234 704 362 3113</strong>.
              </li>
            </ul>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Pass ID: <strong style={{ fontFamily: 'monospace', color: 'var(--brand-black)' }}>{reservation.passId}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-outline btn-sm">
                  Register Another Guest
                </Link>
                <Link to="/" className="btn btn-dark btn-sm">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
