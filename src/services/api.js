// In development, use Vite's /api proxy (configured to forward to the local
// backend on port 5001). Production deployments supply VITE_API_URL instead.
const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
const API_ORIGIN = API_BASE_URL.startsWith('http')
  ? new URL(API_BASE_URL).origin
  : (typeof window !== 'undefined' ? window.location.origin : '');

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function guestAuthHeaders() {
  const token = sessionStorage.getItem('kas_guest_access_token');
  return authHeaders(token);
}

function normalizeAssetUrl(url) {
  if (!url || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url || '';
  }

  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

function normalizeReservation(reservation) {
  if (!reservation) return reservation;

  return {
    ...reservation,
    idDocumentUrl: normalizeAssetUrl(reservation.idDocumentUrl),
    photoUrl: normalizeAssetUrl(reservation.photoUrl),
    signatureUrl: normalizeAssetUrl(reservation.signatureUrl),
    managerSignatureUrl: normalizeAssetUrl(reservation.managerSignatureUrl)
  };
}

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : {};

  if (!res.ok) {
    const error = new Error(body.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return body;
}

async function requestJson(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  try {
    const res = await fetch(url, options);
    return parseJsonResponse(res);
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      const isConfigured = Boolean(import.meta.env.VITE_API_URL);
      const hint = isConfigured
        ? `Could not reach the backend API at ${url}. Please verify the server is running and CORS is allowed.`
        : 'Backend API connection failed. If deployed on Vercel, please set the VITE_API_URL environment variable to your backend URL (e.g. https://your-backend.vercel.app/api).';
      const connectionError = new Error(hint);
      connectionError.status = 503;
      throw connectionError;
    }
    throw err;
  }
}

export const api = {
  async getReservations(filters = {}, token = '') {
    const query = new URLSearchParams(filters).toString();
    const data = await requestJson(`/reservations${query ? `?${query}` : ''}`, {
      headers: authHeaders(token)
    });
    return data.map(normalizeReservation);
  },

  async checkFlatConflict(flat, checkInDate, checkOutDate, excludeId = null) {
    const query = new URLSearchParams({
      flat,
      checkInDate,
      checkOutDate,
      ...(excludeId ? { excludeId } : {})
    }).toString();

    return requestJson(`/reservations/check-conflict?${query}`);
  },

  async getReservation(idOrPassId) {
    try {
      const data = await requestJson(`/reservations/${encodeURIComponent(idOrPassId)}`);
      return normalizeReservation(data);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async createReservation(payload) {
    const data = await requestJson('/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...guestAuthHeaders() },
      body: JSON.stringify(payload)
    });

    return {
      ...data,
      reservation: normalizeReservation(data.reservation)
    };
  },

  async updateReservationStatus(id, status, notes = '', token = '') {
    const data = await requestJson(`/reservations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify({ status, notes })
    });

    return {
      ...data,
      reservation: normalizeReservation(data.reservation)
    };
  },

  async getFlats(token = '') {
    return requestJson('/flats', {
      headers: authHeaders(token)
    });
  },

  async addFlat(flat, token = '') {
    return requestJson('/flats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(flat)
    });
  },

  async updateFlat(id, updates, token = '') {
    return requestJson(`/flats/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(updates)
    });
  },

  async getStats(token = '') {
    return requestJson('/stats', {
      headers: authHeaders(token)
    });
  },

  async resetData(token = '') {
    return requestJson('/stats/reset', {
      method: 'POST',
      headers: authHeaders(token)
    });
  },

  async login(email, password) {
    return requestJson('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  async requestGuestAccess(password) {
    return requestJson('/auth/guest-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  },

  async getMe(token = '') {
    return requestJson('/auth/me', {
      headers: authHeaders(token)
    });
  },

  async updateSettings(updates, token = '') {
    const data = await requestJson('/auth/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(updates)
    });

    return data.admin;
  },

  async extendStay(id, newCheckOutDate) {
    const data = await requestJson(`/reservations/${encodeURIComponent(id)}/extend-stay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...guestAuthHeaders() },
      body: JSON.stringify({ newCheckOutDate })
    });

    return {
      ...data,
      reservation: normalizeReservation(data.reservation)
    };
  },

  async reviewStayExtension(id, { action, notes }, token) {
    const data = await requestJson(`/reservations/${encodeURIComponent(id)}/review-extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify({ action, notes })
    });

    return {
      ...data,
      reservation: normalizeReservation(data.reservation)
    };
  },

  // `kind` routes the file into the right Cloudinary folder.
  async uploadFile(file, kind = 'id-document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    const data = await requestJson('/upload', {
      method: 'POST',
      headers: guestAuthHeaders(),
      body: formData
    });

    return {
      ...data,
      fileUrl: normalizeAssetUrl(data.fileUrl)
    };
  },

  // Removes an upload that was abandoned or replaced before it was saved.
  async deleteUpload(publicId, resourceType = 'image', token = '') {
    if (!publicId) return null;

    return requestJson('/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify({ publicId, resourceType })
    });
  }
};
