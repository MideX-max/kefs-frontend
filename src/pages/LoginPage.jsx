import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { Lock, Mail, ArrowRight, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-surface)',
      padding: '3rem 1.5rem'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        {/* Card */}
        <div className="card" style={{ padding: '2.75rem 2.25rem', backgroundColor: '#ffffff', border: '2px solid var(--brand-black)', boxShadow: 'var(--shadow-lg)' }}>
          
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
              <Logo height={68} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>
              Facility Manager Login
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
              Secure administrative access for guest approval &amp; estate access management.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Email / Manager ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="manager@keffiapartments.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  style={{ fontSize: '0.75rem', color: 'var(--brand-gold-dark)', fontWeight: 600 }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                />
                <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight size={16} />
            </button>
          </form>

        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--text-sub)', fontWeight: 600 }}>
            &larr; Return to Guest Portal
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="modal-overlay" onClick={() => setForgotModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <Info size={36} color="var(--brand-gold-dark)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                Password Assistance
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                For estate administrative security, password resets must be authorized through the Chief Estate Administrator.
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              <strong>Default Manager Accounts:</strong><br />
              • ksaconciergeservices@gmail.com / keffiapartmentadmin1<br />
              • admin@keffi.com / admin234<br />
              • adminkef@keffi.com / admin369
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="btn btn-dark"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
