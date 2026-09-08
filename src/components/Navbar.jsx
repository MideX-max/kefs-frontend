import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { Menu, X, Shield, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/guest-access') {
      return location.pathname === '/guest-access' || location.pathname === '/register';
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="kas-header">
      <div className="container">
        <div className="kas-header-inner">
          {/* Logo */}
          <Link to="/" className="kas-logo-link" onClick={() => setMobileMenuOpen(false)}>
            <Logo height={58} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="kas-nav-links">
            <Link to="/" className={`kas-nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/guest-access" className={`kas-nav-link ${isActive('/guest-access') ? 'active' : ''}`}>
              Guest Registration
            </Link>
            <Link to="/status" className={`kas-nav-link ${isActive('/status') ? 'active' : ''}`}>
              Check Reservation
            </Link>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/admin" className="btn btn-dark btn-sm" style={{ padding: '0.5rem 1rem' }}>
                  <LayoutDashboard size={16} color="var(--brand-gold)" />
                  Manager Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline btn-sm" 
                  title="Sign Out"
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '0.5rem 1rem' }}>
                  <Shield size={16} />
                  Facility Manager
                </Link>
                <Link to="/guest-access" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1.15rem' }}>
                  <UserPlus size={16} />
                  Register Guest
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            padding: '1.25rem 0 1.75rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: '#ffffff'
          }}>
            <Link
              to="/"
              className={`kas-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem' }}
            >
              Home
            </Link>
            <Link
              to="/guest-access"
              className={`kas-nav-link ${isActive('/guest-access') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem' }}
            >
              Guest Registration
            </Link>
            <Link
              to="/status"
              className={`kas-nav-link ${isActive('/status') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem' }}
            >
              Check Reservation
            </Link>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className="btn btn-dark"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} color="var(--brand-gold)" />
                    Facility Manager Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/guest-access"
                    className="btn btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus size={18} />
                    Register Guest
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={18} />
                    Facility Manager Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
