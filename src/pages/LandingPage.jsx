import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { 
  UserPlus, Search, ShieldCheck, FileCheck, QrCode, 
  ArrowRight, Building2, CheckCircle2, Lock
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setSearchError('Please enter a Pass ID or Email');
      return;
    }
    navigate(`/status?q=${encodeURIComponent(searchId.trim())}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* 1. Hero Section */}
      <section className="hero-section" style={{ textAlign: 'center', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Logo height={80} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div className="hero-badge" style={{ marginBottom: 0 }}>
              <ShieldCheck size={16} color="var(--brand-gold)" />
              Official Access Portal
            </div>
          </div>
          
          <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
            KEFFI APARTMENT SUITES
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '35px', height: '2px', backgroundColor: 'var(--brand-gold)' }}></div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-black)' }}>
              Guest Registration &amp; Access Management
            </span>
            <div style={{ width: '35px', height: '2px', backgroundColor: 'var(--brand-gold)' }}></div>
          </div>

          <p className="hero-subtitle" style={{ margin: '0 auto 2.5rem', maxWidth: '720px' }}>
            Welcome to the digital guest management portal for KEFFI APARTMENT SUITES. Apartment managers can register their guest stay, submit identification, and receive an official verified digital gate pass for seamless estate entry.
          </p>

          <div className="hero-actions" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
            <Link to="/guest-access" className="btn btn-primary btn-lg">
              <UserPlus size={20} />
              Register Guest
            </Link>
            <Link to="/status" className="btn btn-dark btn-lg">
              <Search size={20} color="var(--brand-gold)" />
              Check Reservation
            </Link>
          </div>

          {/* Security Bullet points */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-sub)', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={17} color="#10b981" />
              <span>Instant Automated Approval</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={17} color="#10b981" />
              <span>Downloadable &amp; Printable PDF</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={17} color="#10b981" />
              <span>Gatehouse Verified</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Quick Search Floating Bar */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <div className="quick-search-card">
          <form onSubmit={handleQuickSearch} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px' }}>
              <Search size={22} color="var(--brand-gold-dark)" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--brand-black)' }}>
                  Look Up Existing Reservation
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enter your Pass ID (e.g. KAS-2026-0723-01)
                </span>
              </div>
            </div>

            <div style={{ flex: '2 1 320px', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Pass ID or registered email..."
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  setSearchError('');
                }}
                style={{ padding: '0.75rem 1rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                Find Pass
              </button>
            </div>
          </form>
          {searchError && (
            <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
              {searchError}
            </p>
          )}
        </div>
      </section>

      {/* 3. Three Simple Steps Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: 'var(--brand-gold-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
              ACCESS CONTROL WORKFLOW
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.02em' }}>
              Three Simple Steps to Estate Entry
            </h2>
            <p style={{ color: 'var(--text-sub)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
              Designed for ease of use by guests and apartment representatives while upholding estate security.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2rem' }}>
            
            {/* Step 1 */}
            <div className="card" style={{ padding: '2.25rem 2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'rgba(243, 196, 40, 0.35)',
                fontFamily: 'monospace'
              }}>
                01
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-black)',
                color: 'var(--brand-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <UserPlus size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.75rem' }}>
                Register
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Submit guest details, assigned flat (e.g. Azalea C1), check-in/out dates, identification document, and digital signature.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '2.25rem 2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'rgba(243, 196, 40, 0.35)',
                fontFamily: 'monospace'
              }}>
                02
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-black)',
                color: 'var(--brand-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <FileCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.75rem' }}>
                Get Approved
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                The system automatically validates your submission and applies the authorized Facility Manager signature. Exceptions are escalated for manual review.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '2.25rem 2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'rgba(243, 196, 40, 0.35)',
                fontFamily: 'monospace'
              }}>
                03
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-black)',
                color: 'var(--brand-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <QrCode size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.75rem' }}>
                Receive Gate Pass
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Download or print your official KEFFI APARTMENT SUITES gate pass. Present it at the main gatehouse upon arrival for estate entry.
              </p>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/guest-access" className="btn btn-primary btn-lg">
              Start Guest Registration Now
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Estate Access Notice & Guidelines */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid var(--brand-black)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--brand-gold-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <Lock size={18} />
                  Estate Security Policy
                </div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '1rem' }}>
                  Estate Gatehouse Access Guidelines
                </h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Access into the premises will only be granted after the registration form has been properly filled and approved by management. Gate passes expire automatically upon check-out time.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="var(--brand-gold-dark)" />
                    <span>Every guest or party must have a valid Pass ID on file.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="var(--brand-gold-dark)" />
                    <span>Government ID (NIN, Passport, or Driver's License) is required.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="var(--brand-gold-dark)" />
                    <span>Expired passes are strictly denied automated gate clearance.</span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <Building2 size={40} color="var(--brand-gold-dark)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
                  Facility Manager Access
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
                  Property managers, estate administrators, and front-desk personnel can sign in to inspect guest submissions, review flagged documents, and configure access settings.
                </p>
                <Link to="/login" className="btn btn-dark" style={{ width: '100%' }}>
                  <ShieldCheck size={18} color="var(--brand-gold)" />
                  Sign In to Management Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
