import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useReservations } from '../context/ReservationContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDatePass } from '../utils/constants.js';
import { Search, ArrowRight, AlertCircle, CalendarPlus, CheckCircle2 } from 'lucide-react';

export default function StatusCheckPage() {
  const [searchParams] = useSearchParams();
  const { getReservationById, extendStay } = useReservations();

  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showExtend, setShowExtend] = useState(false);
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [extending, setExtending] = useState(false);
  const [extendError, setExtendError] = useState('');
  const [extendSuccess, setExtendSuccess] = useState('');

  const getMinExtensionDate = (checkOutDate) => {
    if (!checkOutDate) return '';
    try {
      const [y, m, d] = checkOutDate.split('-').map(Number);
      const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
      return nextDay.toISOString().slice(0, 10);
    } catch {
      return checkOutDate;
    }
  };

  const handleExtendStay = async () => {
    if (!newCheckOutDate) {
      setExtendError('Please select a new check-out date.');
      return;
    }

    if (newCheckOutDate <= result.checkOutDate) {
      setExtendError(`New check-out date must be after current check-out date (${result.checkOutDate}).`);
      return;
    }

    setExtending(true);
    setExtendError('');
    setExtendSuccess('');

    try {
      const updated = await extendStay(result.id || result.passId, newCheckOutDate);
      if (updated) {
        setResult(updated);
      }
      setExtendSuccess(`Stay successfully extended to ${formatDatePass(newCheckOutDate)}!`);
      setShowExtend(false);
      setNewCheckOutDate('');
    } catch (err) {
      setExtendError(err.message || 'Failed to extend stay. Please try again.');
    } finally {
      setExtending(false);
    }
  };

  const handleSearch = useCallback(async (e, overrideQuery = query) => {
    if (e) e.preventDefault();
    const lookup = overrideQuery.trim();
    if (!lookup) {
      setError('Please enter a Pass ID');
      return;
    }

    setLoading(true);
    setError('');
    setExtendSuccess('');
    setExtendError('');
    setShowExtend(false);
    setSearched(true);

    try {
      const found = await getReservationById(lookup);
      setResult(found);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to look up reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getReservationById, query]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;

    let ignore = false;
    async function executeSearch() {
      const lookup = q.trim();
      if (!lookup) return;

      setLoading(true);
      setError('');
      setSearched(true);

      try {
        const found = await getReservationById(lookup);
        if (!ignore) setResult(found);
      } catch (searchErr) {
        console.error('Lookup error:', searchErr);
        if (!ignore) setError('Failed to look up reservation. Please try again.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    executeSearch();

    return () => {
      ignore = true;
    };
  }, [getReservationById, searchParams]);

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh', padding: '4rem 0 6rem' }}>
      <div className="container-narrow">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--brand-gold-dark)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
            GATE ACCESS VERIFICATION
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Check Reservation &amp; Gate Pass Status
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            Enter your unique Reservation/Pass ID.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Pass ID..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError('');
                }}
                style={{ height: '48px', fontSize: '1rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ height: '48px', flexShrink: 0 }}
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Check Status'}
            </button>
          </form>
          {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>{error}</p>}
        </div>

        {/* Search Result */}
        {searched && (
          <div>
            {result ? (
              <div className="card" style={{ padding: '2.25rem', backgroundColor: '#ffffff', border: '2px solid var(--brand-black)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>RESERVATION IDENTIFIER</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--brand-black)', fontFamily: 'monospace' }}>
                      {result.passId}
                    </strong>
                  </div>
                  <StatusBadge status={result.status} size="lg" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>GUEST NAME</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--brand-black)' }}>{result.guestName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ALLOCATED FLAT</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--brand-black)' }}>{result.flat}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CHECK-IN DATE</span>
                    <strong>{formatDatePass(result.checkInDate)} ({result.checkInTime || '14:00'})</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CHECK-OUT DATE</span>
                    <strong>{formatDatePass(result.checkOutDate)} ({result.checkOutTime || '11:00'})</strong>
                  </div>
                </div>

                {extendSuccess && (
                  <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', color: '#166534', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} />
                    <strong>{extendSuccess}</strong>
                  </div>
                )}

                {/* Inline Extend Form */}
                {showExtend && result.status !== 'Rejected' && result.status !== 'Pending Review' && (
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid var(--brand-gold)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarPlus size={18} color="var(--brand-gold-dark)" />
                      Extend Stay for Pass {result.passId}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Current Check-out: <strong>{formatDatePass(result.checkOutDate)}</strong>
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                          New Check-Out Date
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          value={newCheckOutDate}
                          onChange={(e) => setNewCheckOutDate(e.target.value)}
                          min={getMinExtensionDate(result.checkOutDate)}
                          style={{ width: '100%', height: '42px' }}
                        />
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
                          Quick Add:
                        </span>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {[1, 3, 7].map(days => {
                            const [y, m, d] = (result.checkOutDate || '').split('-').map(Number);
                            const target = new Date(Date.UTC(y, m - 1, d + days));
                            const targetStr = target.toISOString().slice(0, 10);
                            const isSelected = newCheckOutDate === targetStr;
                            return (
                              <button
                                key={days}
                                type="button"
                                onClick={() => setNewCheckOutDate(targetStr)}
                                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', minHeight: 'auto' }}
                              >
                                +{days}d
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {extendError && (
                      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: '0.85rem' }}>
                        {extendError}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => { setShowExtend(false); setNewCheckOutDate(''); setExtendError(''); }}
                        className="btn btn-outline"
                        disabled={extending}
                        style={{ fontSize: '0.875rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExtendStay}
                        disabled={extending || !newCheckOutDate}
                        className="btn btn-primary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        {extending ? 'Updating...' : 'Confirm Extension'}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    {result.status === 'Pending Review' 
                      ? '⚠️ Submission under review by Facility Manager.'
                      : '✅ Pass is active and authorized for gate entry.'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {result.status !== 'Rejected' && result.status !== 'Pending Review' && (
                      <button
                        type="button"
                        onClick={() => setShowExtend(!showExtend)}
                        className="btn btn-outline"
                        style={{ borderColor: 'var(--brand-gold-dark)' }}
                      >
                        <CalendarPlus size={16} color="var(--brand-gold-dark)" />
                        {showExtend ? 'Close Extension' : 'Extend Stay'}
                      </button>
                    )}
                    <Link to={`/pass/${result.passId}`} className="btn btn-primary">
                      View &amp; Print Pass
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <AlertCircle size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.5rem' }}>
                  No Reservation Found
                </h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  We could not find any active or past reservation matching "<strong>{query}</strong>". Please check for typos or register a new guest.
                </p>
                <Link to="/register" className="btn btn-dark">
                  Register Guest Now
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
