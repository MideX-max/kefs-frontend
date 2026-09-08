import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useReservations } from '../context/ReservationContext.jsx';
import Logo from '../components/Logo.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ReservationModal from '../components/ReservationModal.jsx';
import SignaturePad from '../components/SignaturePad.jsx';
import { formatDatePass } from '../utils/constants.js';
import { 
  LayoutDashboard, Users, Calendar, AlertTriangle, 
  Building2, History, Settings, LogOut, Search, Filter, Eye, 
  CheckCircle, Download, Plus, RefreshCw, ShieldCheck, 
  Phone, Mail, Menu, X, Save
} from 'lucide-react';

// Mirrors the status vocabulary returned by GET /api/flats.
const FLAT_OCCUPANCY = {
  occupied: { label: 'Occupied', badge: 'badge-approved', accent: '#10b981' },
  reserved: { label: 'Reserved', badge: 'badge-upcoming', accent: '#f59e0b' },
  available: { label: 'Available', badge: 'badge-expired', accent: '#cbd5e1' }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, updateProfile, defaultSignature } = useAuth();
  const { 
    reservations, flats, stats, loading, filters, setFilters, 
    fetchReservations, updateStatus, addFlat 
  } = useReservations();

  const [activeTab, setActiveTab] = useState('overview'); // overview, reservations, pending, guests, flats, history, settings
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Settings State
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name || 'Engr. David Okon',
    role: user?.role || 'Chief Facility Manager',
    email: user?.email || 'manager@keffiapartments.ng',
    phone: user?.phone || '+234 803 000 1122',
    estateName: user?.estateName || 'KEFFI APARTMENT SUITES',
    defaultSignature: defaultSignature
  }));
  const [savingSettings, setSavingSettings] = useState(false);

  // Add-flat form state
  const [showAddFlat, setShowAddFlat] = useState(false);
  const [savingFlat, setSavingFlat] = useState(false);
  const [flatForm, setFlatForm] = useState({ name: '', block: '', floor: '', type: '', description: '' });

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // While the mobile drawer is open, close it on Escape and keep the page
  // behind it from scrolling.
  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleStatusChange = async (id, status, notes) => {
    try {
      await updateStatus(id, status, notes);
      showToast(`Reservation status updated to "${status}".`);
    } catch {
      showToast('Error updating status.');
    }
  };

  const handleAddFlat = async (e) => {
    e.preventDefault();
    setSavingFlat(true);
    try {
      const created = await addFlat(flatForm);
      setFlatForm({ name: '', block: '', floor: '', type: '', description: '' });
      setShowAddFlat(false);
      showToast(`Flat "${created.name}" added successfully.`);
    } catch (err) {
      showToast(err.message || 'Error adding flat.');
    } finally {
      setSavingFlat(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateProfile(profileForm);
      showToast('Facility Manager profile & default signature updated successfully.');
    } catch {
      showToast('Error saving profile settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered reservations based on active view
  const getDisplayedReservations = () => {
    let list = [...reservations];
    if (activeTab === 'pending') {
      return list.filter(r => r.status === 'Pending Review');
    }
    if (activeTab === 'history') {
      return list.filter(r => r.status === 'Expired' || r.status === 'Rejected');
    }
    return list;
  };

  const displayedList = getDisplayedReservations();

  return (
    <div className="admin-layout">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--brand-black)',
          color: '#ffffff',
          border: '1.5px solid var(--brand-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={18} color="var(--brand-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-overlay open"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. Sidebar */}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}
      >
        
        {/* Header */}
        <div className="admin-sidebar-header">
          <div style={{ backgroundColor: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '6px', width: '100%', textAlign: 'center' }}>
            <Logo height={46} />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="admin-nav">
          <button
            onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => { setActiveTab('reservations'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>All Reservations</span>
            <span style={{ marginLeft: 'auto', backgroundColor: '#27272a', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {reservations.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('pending'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'pending' ? 'active' : ''}`}
          >
            <AlertTriangle size={18} color={stats?.pendingReview > 0 ? 'var(--brand-gold)' : 'currentColor'} />
            <span>Pending Review</span>
            {stats?.pendingReview > 0 && (
              <span style={{ marginLeft: 'auto', backgroundColor: '#b45309', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                {stats.pendingReview}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'guests' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Guests Directory</span>
          </button>

          <button
            onClick={() => { setActiveTab('flats'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'flats' ? 'active' : ''}`}
          >
            <Building2 size={18} />
            <span>Flats &amp; Occupancy</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          >
            <History size={18} />
            <span>Reservation History</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Manager Settings</span>
          </button>
        </nav>

        {/* Footer / User info */}
        <div className="admin-sidebar-footer">
          <div style={{ overflow: 'hidden' }}>
            <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Facility Manager'}
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>
              {user?.role || 'Chief Administrator'}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn btn-sm"
            style={{ padding: '0.35rem 0.5rem', backgroundColor: '#27272a', color: '#ef4444' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>

      </aside>

      {/* 2. Main Content Area */}
      <div className="admin-content">
        
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-lead">
            <button
              className="mobile-nav-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label={mobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileSidebarOpen}
              aria-controls="admin-sidebar"
            >
              {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="admin-topbar-heading">
              <h1>
                {activeTab === 'overview' && 'Estate Overview & Statistics'}
                {activeTab === 'reservations' && 'All Guest Reservations'}
                {activeTab === 'pending' && 'Flagged Reservations Requiring Review'}
                {activeTab === 'guests' && 'Registered Guests Directory'}
                {activeTab === 'flats' && 'Flats & Suite Occupancy Management'}
                {activeTab === 'history' && 'Past & Expired Reservations'}
                {activeTab === 'settings' && 'Facility Manager Profile & Signature'}
              </h1>
              <span>KEFFI APARTMENT SUITES &bull; Internal Access Control System</span>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <button
              onClick={async () => {
                await fetchReservations();
                showToast('Reservations and flat occupancy data refreshed.');
              }}
              className="btn btn-outline btn-sm"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="btn-label">Refresh</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} />
              <span className="btn-label">Register New Guest</span>
              <span className="btn-label-short">New Guest</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="admin-main-view">
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards Grid */}
              <div className="stat-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--brand-gold)' }}>
                  <div>
                    <span className="stat-label">Total Guests</span>
                    <div className="stat-value">{stats?.totalGuests || 0}</div>
                  </div>
                  <Users size={28} color="var(--brand-gold-dark)" />
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <div>
                    <span className="stat-label">Active Reservations</span>
                    <div className="stat-value" style={{ color: '#059669' }}>{stats?.activeReservations || 0}</div>
                  </div>
                  <CheckCircle size={28} color="#10b981" />
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div>
                    <span className="stat-label">Upcoming Reservations</span>
                    <div className="stat-value" style={{ color: '#1d4ed8' }}>{stats?.upcomingReservations || 0}</div>
                  </div>
                  <Calendar size={28} color="#3b82f6" />
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div>
                    <span className="stat-label">Pending Review</span>
                    <div className="stat-value" style={{ color: '#d97706' }}>{stats?.pendingReview || 0}</div>
                  </div>
                  <AlertTriangle size={28} color="#f59e0b" />
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #6b7280' }}>
                  <div>
                    <span className="stat-label">Expired Passes</span>
                    <div className="stat-value" style={{ color: '#4b5563' }}>{stats?.expiredPasses || 0}</div>
                  </div>
                  <History size={28} color="#6b7280" />
                </div>
              </div>

              {/* Quick Filter Bar */}
              <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 240px' }}>
                  <Search size={18} color="var(--text-muted)" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by Guest Name, Pass ID, Phone..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <Filter size={15} />
                    <span>Filter:</span>
                  </div>

                  <select
                    className="form-select"
                    value={filters.flat}
                    onChange={(e) => setFilters(prev => ({ ...prev, flat: e.target.value }))}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="All">All Flats</option>
                    {flats.map(f => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Expired">Expired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Reservations Table */}
              <div className="kas-table-container">
                <table className="kas-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Flat</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Status</th>
                      <th>Pass ID</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No reservations match the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedList.map((res) => (
                        <tr key={res.id}>
                          <td>
                            <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--brand-black)' }}>
                              {res.guestName}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {res.phone} {res.email ? `• ${res.email}` : ''}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: 'var(--brand-black)' }}>
                              {res.flat}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>{formatDatePass(res.checkInDate)}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.checkInTime || '14:00'}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>{formatDatePass(res.checkOutDate)}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.checkOutTime || '11:00'}</span>
                          </td>
                          <td>
                            <StatusBadge status={res.status} size="sm" />
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                              {res.passId}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedReservation(res)}
                                className="btn btn-outline btn-sm"
                                title="Inspect Details"
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/pass/${res.passId}`)}
                                className="btn btn-dark btn-sm"
                                title="Download Pass PDF"
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <Download size={14} color="var(--brand-gold)" />
                                Pass
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: RESERVATIONS / PENDING / HISTORY ================= */}
          {(activeTab === 'reservations' || activeTab === 'pending' || activeTab === 'history') && (
            <div>
              <div className="kas-table-container">
                <table className="kas-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Flat</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Status</th>
                      <th>Audit Note</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No reservations in this view.
                        </td>
                      </tr>
                    ) : (
                      displayedList.map((res) => (
                        <tr key={res.id}>
                          <td>
                            <strong style={{ display: 'block', fontSize: '0.925rem', color: 'var(--brand-black)' }}>
                              {res.guestName}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {res.phone} • {res.idType}
                            </span>
                          </td>
                          <td>
                            <strong>{res.flat}</strong>
                          </td>
                          <td>{formatDatePass(res.checkInDate)}</td>
                          <td>{formatDatePass(res.checkOutDate)}</td>
                          <td>
                            <StatusBadge status={res.status} size="sm" />
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {res.verificationNotes || 'Verified'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedReservation(res)}
                                className="btn btn-outline btn-sm"
                              >
                                <Eye size={14} />
                                Review
                              </button>
                              <button
                                onClick={() => navigate(`/pass/${res.passId}`)}
                                className="btn btn-dark btn-sm"
                              >
                                <Download size={14} color="var(--brand-gold)" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: GUESTS DIRECTORY ================= */}
          {activeTab === 'guests' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1.25rem' }}>
              {reservations.map((res) => (
                <div key={res.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <StatusBadge status={res.status} size="sm" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {res.passId}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-black)', marginBottom: '0.25rem' }}>
                      {res.guestName}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--brand-gold-dark)', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Assigned: {res.flat}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} color="var(--text-muted)" />
                        <span>{res.phone}</span>
                      </div>
                      {res.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} color="var(--text-muted)" />
                          <span>{res.email}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{formatDatePass(res.checkInDate)} &rarr; {formatDatePass(res.checkOutDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedReservation(res)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Eye size={14} />
                      View Dossier
                    </button>
                    <button
                      onClick={() => navigate(`/pass/${res.passId}`)}
                      className="btn btn-dark btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Download size={14} color="var(--brand-gold)" />
                      Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= TAB 4: FLATS & OCCUPANCY ================= */}
          {activeTab === 'flats' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Occupancy is calculated by the server from live reservation dates.
                </span>
                <button
                  onClick={() => setShowAddFlat(prev => !prev)}
                  className="btn btn-outline-gold btn-sm"
                >
                  {showAddFlat ? <X size={14} /> : <Plus size={14} />}
                  {showAddFlat ? 'Cancel' : 'Add New Flat'}
                </button>
              </div>

              {showAddFlat && (
                <form onSubmit={handleAddFlat} className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Flat Name <span className="required">*</span></label>
                      <input
                        className="form-input"
                        value={flatForm.name}
                        onChange={(e) => setFlatForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Everest"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Block</label>
                      <input
                        className="form-input"
                        value={flatForm.block}
                        onChange={(e) => setFlatForm(prev => ({ ...prev, block: e.target.value }))}
                        placeholder="Main Building"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Floor</label>
                      <input
                        className="form-input"
                        value={flatForm.floor}
                        onChange={(e) => setFlatForm(prev => ({ ...prev, floor: e.target.value }))}
                        placeholder="1st Floor"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Suite Type</label>
                      <input
                        className="form-input"
                        value={flatForm.type}
                        onChange={(e) => setFlatForm(prev => ({ ...prev, type: e.target.value }))}
                        placeholder="Standard Suite"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      className="form-input"
                      value={flatForm.description}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Short description shown to guests during registration."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={savingFlat}>
                    <Save size={14} />
                    {savingFlat ? 'Saving…' : 'Create Flat'}
                  </button>
                </form>
              )}

              {flats.length === 0 ? (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No flats registered yet. Use &ldquo;Add New Flat&rdquo; to create the first suite.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
                  {flats.map((flat) => {
                    const occupancy = FLAT_OCCUPANCY[flat.status] || FLAT_OCCUPANCY.available;
                    const currentRes = flat.currentPassId
                      ? reservations.find(r => r.passId === flat.currentPassId)
                      : null;

                    return (
                      <div key={flat.id} className="card" style={{ padding: '1.75rem', borderLeft: `5px solid ${occupancy.accent}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                            {flat.name}
                          </h3>
                          <span className={`badge ${occupancy.badge}`}>{occupancy.label}</span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          {[flat.block, flat.floor, flat.type].filter(Boolean).join(' • ')}
                        </div>

                        {flat.currentGuest ? (
                          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                              {flat.status === 'reserved' ? 'UPCOMING GUEST' : 'CURRENT GUEST'}
                            </span>
                            <strong style={{ fontSize: '1rem', color: 'var(--brand-black)', display: 'block', marginBottom: '0.35rem' }}>
                              {flat.currentGuest}
                            </strong>
                            {currentRes && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                Stay: {formatDatePass(currentRes.checkInDate)} &rarr; {formatDatePass(currentRes.checkOutDate)}
                              </span>
                            )}
                            <div style={{ marginTop: '0.75rem' }}>
                              <button
                                onClick={() => currentRes && setSelectedReservation(currentRes)}
                                className="btn btn-outline btn-sm"
                                style={{ width: '100%', fontSize: '0.75rem' }}
                                disabled={!currentRes}
                              >
                                {currentRes ? 'Manage Guest Pass' : flat.currentPassId}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {flat.description || 'Unit ready for new guest allocation. No active pass registered.'}
                            <div style={{ marginTop: '1rem' }}>
                              <button
                                onClick={() => navigate('/register')}
                                className="btn btn-outline-gold btn-sm"
                                style={{ width: '100%' }}
                              >
                                <Plus size={14} />
                                Assign Guest to {flat.name}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: MANAGER SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '720px' }}>
              <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1.5px solid var(--border-light)' }}>
                  <ShieldCheck size={26} color="var(--brand-gold-dark)" />
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                      Facility Manager Settings &amp; Signature
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Configure administrative profile and the authorized signature applied to issued passes.
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Manager Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Official Role / Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileForm.role}
                        onChange={(e) => setProfileForm(p => ({ ...p, role: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Manager Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Security &amp; Gate Contact Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Authorized Default Signature Pad */}
                  <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <SignaturePad
                      value={profileForm.defaultSignature}
                      onChange={(sig) => setProfileForm(p => ({ ...p, defaultSignature: sig }))}
                      label="Facility Manager Authorized Signature"
                      required={false}
                    />
                    <span className="form-hint" style={{ marginTop: '-0.5rem', display: 'block', marginBottom: '1.5rem' }}>
                      This signature is automatically rendered on the official Gate Pass upon approved registration.
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="btn btn-primary btn-lg"
                    >
                      <Save size={18} />
                      {savingSettings ? 'Saving Settings...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Detail Inspection Modal */}
      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}

    </div>
  );
}
