import { useNotifications } from '../context/NotificationContext.jsx';
import { 
  Bell, Check, CheckCircle, AlertTriangle, XCircle, 
  UserPlus, Clock, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ onClose, onSelectReservation }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const getNotifIcon = (type) => {
    switch (type) {
      case 'new_registration':
        return <UserPlus size={16} color="#3b82f6" />;
      case 'id_flagged':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'id_approved':
        return <CheckCircle size={16} color="#10b981" />;
      case 'id_rejected':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Bell size={16} color="var(--brand-gold-dark)" />;
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markRead(notif._id);
    }
    if (onSelectReservation && notif.reservationId) {
      onSelectReservation(notif.reservationId);
      if (onClose) onClose();
    } else if (notif.passId) {
      navigate(`/pass/${notif.passId}`);
      if (onClose) onClose();
    }
  };

  return (
    <div className="kas-notif-panel">
      {/* Header */}
      <div className="kas-notif-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} color="var(--brand-gold-dark)" />
          <strong style={{ fontSize: '0.95rem', color: 'var(--brand-black)' }}>
            Real-Time Notifications
          </strong>
          {unreadCount > 0 && (
            <span className="kas-notif-badge-count">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            <Check size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="kas-notif-list">
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No notifications yet.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`kas-notif-item ${!notif.isRead ? 'unread' : ''}`}
            >
              <div className="kas-notif-icon">
                {getNotifIcon(notif.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span className="kas-notif-title">
                    {notif.title}
                  </span>
                  <span className="kas-notif-time">
                    <Clock size={11} />
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="kas-notif-msg">
                  {notif.message}
                </p>
                {notif.flagReason && (
                  <span className="kas-notif-reason">
                    Reason: {notif.flagReason}
                  </span>
                )}
              </div>
              {notif.passId && (
                <ExternalLink size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
