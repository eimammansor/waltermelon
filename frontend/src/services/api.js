import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- GLOBAL ERROR HANDLING ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || 'Engine Connection Error';
    console.error('🚀 API Error:', message);
    // You can add a toast notification here later
    return Promise.reject(error);
  }
);

export const workflowService = {
  // GET: Fetch all automation tasks
  getAll: () => api.get('/api/workflows/'),
  
  // POST: Save a new task to SQLite
  create: (data) => api.post('/api/workflows/', data),
  
  // PATCH: Toggle active/inactive status
  update: (id, data) => api.patch(`/api/workflows/${id}/`, data),
  
  // POST: Manually run a task right now
  trigger: (id) => api.post(`/api/workflows/${id}/trigger/`),
  
  // DELETE: Remove a task
  delete: (id) => api.delete(`/api/workflows/${id}/`),
  
  // GET: Fetch the execution history
  getLogs: () => api.get('/api/logs/'),
};

export default api;