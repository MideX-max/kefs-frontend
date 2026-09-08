import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from '../services/api.js';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [flats, setFlats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    flat: 'All',
    search: ''
  });

  const fetchReservations = useCallback(async (customFilters = filters) => {
    if (!isAuthenticated || !token) {
      setReservations([]);
      setStats(null);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getReservations(customFilters, token);
      setReservations(data || []);
      const statsData = await api.getStats(token);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated, token]);

  // Flats are public, so they load whether or not a manager is signed in. The
  // backend computes each flat's live occupancy, so this is also what keeps the
  // dashboard's occupancy view in step with the reservations.
  const fetchFlats = useCallback(async () => {
    try {
      const data = await api.getFlats(token || '');
      setFlats(data || []);
      return data;
    } catch (err) {
      console.error('Failed to fetch flats:', err);
      return [];
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;

    async function loadReservations() {
      if (!isAuthenticated || !token) {
        setReservations([]);
        setStats(null);
        return;
      }

      setLoading(true);
      try {
        const data = await api.getReservations(filters, token);
        if (!ignore) setReservations(data || []);
        const statsData = await api.getStats(token);
        if (!ignore) setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadReservations();

    return () => {
      ignore = true;
    };
  }, [filters, isAuthenticated, token]);

  useEffect(() => {
    let ignore = false;

    async function loadFlats() {
      try {
        const data = await api.getFlats(token || '');
        if (!ignore) setFlats(data || []);
      } catch (err) {
        console.error('Failed to fetch flats:', err);
      }
    }

    loadFlats();

    return () => {
      ignore = true;
    };
  }, [token]);

  const submitReservation = async (payload) => {
    setLoading(true);
    try {
      const res = await api.createReservation(payload);
      if (isAuthenticated) {
        await fetchReservations();
      }
      return res.reservation;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    const res = await api.updateReservationStatus(id, status, notes, token);
    await Promise.all([fetchReservations(), fetchFlats()]);
    return res.reservation;
  };

  const addFlat = async (flat) => {
    const created = await api.addFlat(flat, token);
    await fetchFlats();
    return created;
  };

  const updateFlat = async (id, updates) => {
    const updated = await api.updateFlat(id, updates, token);
    await Promise.all([fetchFlats(), fetchReservations()]);
    return updated;
  };

  const getReservationById = async (idOrPassId) => {
    return api.getReservation(idOrPassId);
  };

  const extendStay = async (id, newCheckOutDate) => {
    setLoading(true);
    try {
      const res = await api.extendStay(id, newCheckOutDate);
      await fetchReservations();
      return res.reservation;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReservationContext.Provider value={{
      reservations,
      flats,
      flatNames: flats.map(flat => flat.name),
      stats,
      loading,
      filters,
      setFilters,
      fetchReservations,
      fetchFlats,
      submitReservation,
      updateStatus,
      addFlat,
      updateFlat,
      getReservationById,
      extendStay
    }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}
