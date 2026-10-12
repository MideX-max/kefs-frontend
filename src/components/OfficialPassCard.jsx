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
    airbnbBooking,
    airbnbScreenshotUrl,
    status = "Approved"
  } = reservation;

  const isExpired = status?.toLowerCase() === 'expired';

  return (
    <div 
      ref={ref} 
      className={`kas-pass-paper pass-printable-container ${className}`}
      id="kas-official-guest-pass"
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
      <div className="pass-header">
        <img
          src="/logo.png"
          alt="KEFFI APARTMENT SUITES"
          className="pass-logo-img"
        />
        <h1 className="pass-title-main">
          KEFFI APARTMENT SUITES GUEST RESERVATION
        </h1>
        <p className="pass-subtitle">
          The details of your reservation for access into the Estate:
        </p>
        {(airbnbBooking || airbnbScreenshotUrl) && (
          <div className="pass-airbnb-badge">
            <span>🏠</span> Verified Airbnb Booking Document Attached
          </div>
        )}
      </div>

      {/* 2. Dotted Field Lines matching physical reference */}
      <div className="pass-fields-container">
        
        {/* NAME Field */}
        <div className="pass-line-row">
          <span className="pass-line-label">
            NAME:
          </span>
          <div className="pass-line-slot">
            <span className="pass-line-value">
              {guestName || "—"}
            </span>
          </div>
        </div>

        {/* FLAT NO Field */}
        <div className="pass-line-row">
          <span className="pass-line-label">
            FLAT NO:
          </span>
          <div className="pass-line-slot">
            <span className="pass-line-value">
              {flat || "—"}
            </span>
          </div>
        </div>

        {/* START DATE & END DATE Field */}
        <div className="pass-line-dates">
          {/* Start Date */}
          <div className="pass-line-row pass-date-field">
            <span className="pass-line-label">
              START DATE:
            </span>
            <div className="pass-line-slot">
              <span className="pass-line-value">
                {formatDatePass(checkInDate)}
              </span>
            </div>
          </div>

          {/* End Date */}
          <div className="pass-line-row pass-date-field">
            <span className="pass-line-label">
              END DATE:
            </span>
            <div className="pass-line-slot">
              <span className="pass-line-value">
                {formatDatePass(checkOutDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="pass-signatures-container">
          
          {/* Guest / Flat Owner Signature */}
          <div className="pass-sig-block">
            <span className="pass-sig-caption">
              FLAT OWNERS/REPRESENTATIVE’S SIGNATURE :
            </span>
            <div className="pass-sig-slot">
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Representative Signature"
                  className="pass-sig-img"
                />
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#888888', fontStyle: 'italic' }}>
                  (Digitally Verified Submission)
                </span>
              )}
            </div>
          </div>

          {/* Facility Manager's Signature */}
          <div className="pass-sig-block">
            <span className="pass-sig-caption">
              FACILITY MANAGER’S SIGNATURE:
            </span>
            <div className="pass-sig-slot">
              <img
                src={managerSignatureUrl || DEFAULT_MANAGER_SIG}
                alt="Facility Manager Signature"
                className="pass-sig-img"
              />
            </div>
          </div>

        </div>

      </div>

      {/* 3. Official Bottom Notice matching physical reference pass */}
      <div className="pass-notice-box">
        <div className="pass-notice-text">
          <span className="pass-notice-nb">NB:</span> Access into the premises will only be granted after the form has been properly filled and signed by management.
        </div>
        <div className="pass-notice-italic">
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
