import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotif, setToastNotif] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications('manager');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead('manager');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  // Connect to real-time SSE stream
  useEffect(() => {
    fetchNotifications();

    const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
    const streamUrl = `${rawApiUrl}/notifications/stream`;

    let eventSource;
    try {
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('notification', (event) => {
        try {
          const newNotif = JSON.parse(event.data);
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          setToastNotif(newNotif);
          setTimeout(() => setToastNotif(null), 5000);
        } catch (e) {
          console.error('Failed to parse SSE notification:', e);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('SSE notification stream error, reconnection will occur automatically.', err);
      };
    } catch (err) {
      console.error('Failed to initialize EventSource:', err);
    }

    // Fallback polling every 20s if SSE fails or disconnects
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 20000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastNotif,
        markRead,
        markAllRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
