// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 👇 Sirf ye add karo
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard/stats'),
getActivities: () => api.get('/admin/dashboard/recent-activity'),
  getSystemHealth: () => api.get('/admin/system/health'),

  // Doctors
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  getDoctor: (id) => api.get(`/admin/doctors/${id}`),
  createDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),

  // Patients
  getPatients: (params) => api.get('/admin/patients', { params }),
  getPatient: (id) => api.get(`/admin/patients/${id}`),
  createPatient: (data) => api.post('/admin/patients', data),
  updatePatient: (id, data) => api.put(`/admin/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/admin/patients/${id}`),

  // Appointments
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  createAppointment: (data) => api.post('/admin/appointments', data),
  updateAppointment: (id, data) => api.put(`/admin/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/appointments/${id}/status`, { status }),

  // Reports
  getReports: () => api.get('/admin/reports'),
  generateReport: (data) => api.post('/admin/reports/generate', data),
  exportData: (type) => api.get(`/admin/reports/export/${type}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export const patientAPI = {
  // Dashboard
  getDashboard: () => api.get("/patient/dashboard"),

  // Doctors
  getDoctors: (params) => api.get("/patients/doctors", { params }),
getDoctor: (id) => api.get(`/patients/doctors/${id}`),

  // Appointments
  getAppointments: () => api.get("/patient/appointments"),
  bookAppointment: (data) => api.post("/patient/appointments", data),
  cancelAppointment: (id) =>
    api.put(`/patient/appointments/${id}/cancel`),

  // Medical History
  getMedicalHistory: () => api.get("/patient/medical-history"),
};

export default api;