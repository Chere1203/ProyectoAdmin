import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor: agregar token JWT a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejar 401 (sesión expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Figuritas ──
export const figuritaService = {
  getAll: (params) => api.get('/figuritas', { params }),
  getById: (id) => api.get(`/figuritas/${id}`),
  getMiAlbum: () => api.get('/figuritas/mi-album/estado'),
  updateEstado: (figurita_id, estado) =>
    api.post('/figuritas/mi-album', { figurita_id, estado }),
};

// ── Intercambios ──
export const intercambioService = {
  getDisponibles: () => api.get('/intercambios'),
  createOffer: (data) => api.post('/intercambios', data),
  getRecibidos: () => api.get('/intercambios/recibidos'),
  accionOffer: (id, accion) => api.post(`/intercambios/${id}/accion`, { accion }),
};

export default api;
