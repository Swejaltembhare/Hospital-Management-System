import axios from "axios";

// Base API Axios Configuration Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Authorization Token Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Status & Unauthorized Exception Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Administrative Platform API Collection
export const adminAPI = {
  getStats: () => api.get("/admin/dashboard/stats"),
  getActivities: () => api.get("/admin/dashboard/recent-activity"),
  getSystemHealth: () => api.get("/admin/system/health"),

  getDoctors: (params) => api.get("/admin/doctors", { params }),
  getDoctor: (id) => api.get(`/admin/doctors/${id}`),
  createDoctor: (data) => api.post("/admin/doctors", data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),

  getPatients: (params) => api.get("/admin/patients", { params }),
  getPatient: (id) => api.get(`/admin/patients/${id}`),
  createPatient: (data) => api.post("/admin/patients", data),
  updatePatient: (id, data) => api.put(`/admin/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/admin/patients/${id}`),

  getAppointments: (params) => api.get("/admin/appointments", { params }),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  createAppointment: (data) => api.post("/admin/appointments", data),
  updateAppointment: (id, data) => api.put(`/admin/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/appointments/${id}/status`, { status }),

  getInvoices: (params) => api.get("/admin/invoices", { params }),
  getInvoice: (id) => api.get(`/admin/invoices/${id}`),
  createInvoice: (data) => api.post("/admin/invoices", data),
  updateInvoice: (id, data) => api.put(`/admin/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/admin/invoices/${id}`),
  updateInvoiceStatus: (id, data) => api.patch(`/admin/invoices/${id}/status`, data),

  getSupportMessages: (params) => api.get("/admin/support-messages", { params }),
  getSupportMessage: (id) => api.get(`/admin/support-messages/${id}`),
  updateSupportMessageStatus: (id, status) =>
    api.patch(`/admin/support-messages/${id}/status`, { status }),
  deleteSupportMessage: (id) => api.delete(`/admin/support-messages/${id}`),

  getReports: () => api.get("/admin/reports"),
  generateReport: (data) => api.post("/admin/reports/generate", data),
  exportData: (type) => api.get(`/admin/reports/export/${type}`),

  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
  changePassword: (data) => api.put("/admin/settings/password", data),

  getNotifications: () => api.get("/admin/notifications"),
  markAllNotificationsRead: () => api.patch("/admin/notifications/mark-all-read"),
  markNotificationRead: (id) => api.patch(`/admin/notifications/${id}/read`),

  getAppointmentTrend: () => api.get("/analytics/appointment-trend"),
  getPatientRegistration: () => api.get("/analytics/patient-registration"),
  getDepartmentData: () => api.get("/analytics/department-data"),
  getAppointmentStatus: () => api.get("/analytics/appointment-status"),
  getDoctorPerformance: () => api.get("/analytics/doctor-performance"),

  getAuditLogs: (params) => api.get("/audit-logs", { params }),
  getAuditLog: (id) => api.get(`/audit-logs/${id}`),
  getAuditLogStats: () => api.get("/audit-logs/stats"),
  cleanupAuditLogs: (days) => api.delete(`/audit-logs/cleanup?days=${days}`),
};

// Patient Portal API Collection
export const patientAPI = {
  getDashboard: () => api.get("/patients/dashboard"),
  getProfile: () => api.get("/patients/profile"),
  updateProfile: (data) => api.put("/patients/profile", data),

  getDoctors: (params) => api.get("/doctors", { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),

  getAppointments: (params) => api.get("/patients/appointments", { params }),
  bookAppointment: (data) => api.post("/patients/appointments", data),
  getAppointment: (id) => api.get(`/patients/appointments/${id}`),
  cancelAppointment: (id) => api.put(`/patients/appointments/${id}/cancel`),
  rateDoctor: (id, rating) => api.put(`/patients/appointments/${id}/rating`, { rating }),

  getMedicalHistory: () => api.get("/patients/medical-history"),
  addMedicalHistory: (data) => api.post("/patients/medical-history", data),
  getMedications: () => api.get("/patients/medications"),
  getHealthMetrics: () => api.get("/patients/health-metrics"),
  getEmergencyContacts: () => api.get("/patients/emergency-contacts"),

  sendSupportMessage: (data) => api.post("/patients/support", data),
  getMyInvoices: () => api.get("/invoices/my"),
  getInvoiceSummary: () => api.get("/invoices/my/summary"),
  getInvoice: (id) => api.get(`/invoices/my/${id}`),
};

export default api;