import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { ShieldCheck, MapPin, Phone, Mail, Clock, Lock } from 'lucide-react';
import { BRAND } from '../utils/constants.js';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111111', color: '#e5e7eb', paddingTop: '4rem', paddingBottom: '2.5rem', borderTop: '4px solid var(--brand-gold)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          
          {/* Col 1: Brand & Logo */}
          <div>
            <div style={{ backgroundColor: '#ffffff', display: 'inline-block', padding: '0.6rem 1.2rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <Logo height={52} />
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Official access control and digital reservation management portal for KEFFI APARTMENT SUITES. Providing secure, seamless guest registration and verified gate entry passes.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-gold)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Official Estate Security Protocol</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', borderBottom: '2px solid var(--brand-gold)', display: 'inline-block', paddingBottom: '0.25rem' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: '#d1d5db', transition: 'color 0.15s' }}>
                  Estate Home
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#d1d5db', transition: 'color 0.15s' }}>
                  Guest Registration Form
                </Link>
              </li>
              <li>
                <Link to="/status" style={{ color: '#d1d5db', transition: 'color 0.15s' }}>
                  Verify &amp; Print Gate Pass
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#d1d5db', transition: 'color 0.15s' }}>
                  Facility Manager Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Property & Gatehouse */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', borderBottom: '2px solid var(--brand-gold)', display: 'inline-block', paddingBottom: '0.25rem' }}>
              Estate &amp; Security Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={18} style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: '2px' }} />
                <span>{BRAND.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={17} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                <span>{BRAND.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={17} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                <span>{BRAND.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={17} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                <span>Standard Check-in: 2:00 PM | Check-out: 11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Col 4: Official Notice Box */}
          <div>
            <div style={{ backgroundColor: '#1c1c1c', border: '1px solid #333333', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                <Lock size={15} />
                <span>ACCESS RESTRICTION NOTICE</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#9ca3af', lineHeight: '1.5' }}>
                Access into KEFFI APARTMENT SUITES is strictly regulated. All visitors and guests must possess a valid, management-approved digital or physical Gate Pass for entry.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #262626', paddingTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
          <div>
            &copy; {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
          </div>
          <div>
            Internal Guest Management &amp; Access Control System
          </div>
        </div>
      </div>
    </footer>
  );
}
