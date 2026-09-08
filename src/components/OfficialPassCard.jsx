import { forwardRef } from 'react';
import StatusBadge from './StatusBadge.jsx';
import { formatDatePass, DEFAULT_MANAGER_SIG } from '../utils/constants.js';

const OfficialPassCard = forwardRef(function OfficialPassCard({ reservation, className = '' }, ref) {
  if (!reservation) {
    return (
      <div className="card p-8 text-center text-gray-500">
        No reservation details available.
      </div>
    );
  }

  const {
    passId,
    guestName,
    flat,
    checkInDate,
    checkOutDate,
    checkInTime = "14:00",
    checkOutTime = "11:00",
    signatureUrl,
    managerSignatureUrl,
    status = "Approved"
  } = reservation;

  const isExpired = status?.toLowerCase() === 'expired';

  return (
    <div 
      ref={ref} 
      className={`kas-pass-paper pass-printable-container ${className}`}
      id="kas-official-guest-pass"
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '2px solid #111111',
        padding: '3rem 2.75rem 2.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        maxWidth: '740px',
        width: '100%',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        color: '#111111'
      }}
    >
      {/* Decorative Corner Sunburst Accents matching physical reference */}
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-tl" />
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-tr" />
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-bl" />
      <img src="/corner-accent.svg" alt="" className="pass-corner-accent pass-corner-br" />

      {/* Expired Watermark if status is Expired */}
      {isExpired && (
        <div className="pass-expired-watermark">
          EXPIRED
        </div>
      )}

      {/* 1. Header: KS Logo Centered */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <img
          src="/logo.png"
          alt="KEFFI APARTMENT SUITES"
          style={{
            height: '92px',
            width: 'auto',
            margin: '0 auto 0.5rem',
            display: 'block',
            objectFit: 'contain'
          }}
        />
        <h1 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#000000',
          margin: '0.25rem 0',
          lineHeight: '1.3'
        }}>
          KEFFI APARTMENT SUITES GUEST RESERVATION
        </h1>
        <p style={{
          fontSize: '1rem',
          fontWeight: 500,
          color: '#262626',
          margin: '0'
        }}>
          The details of your reservation for access into the Estate:
        </p>
      </div>

      {/* 2. Dotted Field Lines matching physical reference */}
      <div style={{ margin: '2rem 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        
        {/* NAME Field */}
        <div className="pass-line-row" style={{ fontSize: '1.15rem' }}>
          <span style={{ fontWeight: 800, color: '#000000', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            NAME:
          </span>
          <div className="pass-line-slot" style={{ marginLeft: '0.5rem', minHeight: '32px' }}>
            <span className="pass-line-value" style={{ fontSize: '1.35rem' }}>
              {guestName || "—"}
            </span>
          </div>
        </div>

        {/* FLAT NO Field */}
        <div className="pass-line-row" style={{ fontSize: '1.15rem' }}>
          <span style={{ fontWeight: 800, color: '#000000', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            FLAT NO:
          </span>
          <div className="pass-line-slot" style={{ marginLeft: '0.5rem', minHeight: '32px' }}>
            <span className="pass-line-value" style={{ fontSize: '1.35rem' }}>
              {flat || "—"}
            </span>
          </div>
        </div>

        {/* START DATE & END DATE Field */}
        <div className="pass-line-dates">
          {/* Start Date */}
          <div className="pass-line-row" style={{ flex: 1, fontSize: '1.1rem' }}>
            <span style={{ fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              START DATE:
            </span>
            <div className="pass-line-slot" style={{ marginLeft: '0.4rem', minHeight: '30px' }}>
              <span className="pass-line-value" style={{ fontSize: '1.2rem' }}>
                {formatDatePass(checkInDate)}
              </span>
            </div>
          </div>

          {/* End Date */}
          <div className="pass-line-row" style={{ flex: 1, fontSize: '1.1rem' }}>
            <span style={{ fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
              END DATE:
            </span>
            <div className="pass-line-slot" style={{ marginLeft: '0.4rem', minHeight: '30px' }}>
              <span className="pass-line-value" style={{ fontSize: '1.2rem' }}>
                {formatDatePass(checkOutDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* Guest / Flat Owner Signature */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', color: '#000000', letterSpacing: '0.02em' }}>
              FLAT OWNERS/REPRESENTATIVE’S SIGNATURE :
            </span>
            <div style={{
              borderBottom: '2px dotted #444444',
              minHeight: '65px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Guest Signature"
                  className="pass-sig-img"
                style={{ maxHeight: '60px', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#888888', fontStyle: 'italic' }}>
                  (Digitally Verified Submission)
                </span>
              )}
            </div>
          </div>

          {/* Facility Manager's Signature */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', color: '#000000', letterSpacing: '0.02em' }}>
              FACILITY MANAGER’S SIGNATURE:
            </span>
            <div style={{
              borderBottom: '2px dotted #444444',
              minHeight: '65px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img
                src={managerSignatureUrl || DEFAULT_MANAGER_SIG}
                alt="Facility Manager Signature"
                className="pass-sig-img"
                style={{ maxHeight: '60px', objectFit: 'contain' }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 3. Official Bottom Notice matching physical reference pass */}
      <div style={{
        marginTop: '1.75rem',
        paddingTop: '1.25rem',
        borderTop: '1.5px solid #d1d5db',
        fontSize: '0.925rem',
        lineHeight: '1.45',
        color: '#1a1a1a'
      }}>
        <div>
          <span style={{ fontWeight: 800, color: '#000000' }}>NB:</span> Access into the premises will only be granted after the form has been properly filled and signed by management.
        </div>
        <div style={{ fontStyle: 'italic', marginTop: '0.35rem', fontWeight: 500 }}>
          Upon expiration, the gate pass can no longer be used.
        </div>
      </div>

      {/* 4. Digital Security Metadata Bar */}
      <div className="pass-meta-bar">
        <div className="pass-meta-group">
          <span style={{ fontWeight: 700, color: '#0f172a' }}>PASS ID:</span>
          <span className="pass-meta-id">
            {passId || "KAS-GEN-0000"}
          </span>
        </div>

        <div className="pass-meta-group">
          <span style={{ color: '#475569' }}>
            Check-in: <strong>{checkInTime}</strong> | Check-out: <strong>{checkOutTime}</strong>
          </span>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

    </div>
  );
});

export default OfficialPassCard;
