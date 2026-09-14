import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./layouts/AdminLayout";
import PatientLayout from "./layouts/patientLayout";
import DoctorLayout from "./layouts/DoctorLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Doctors from "./pages/admin/Doctors";
import Patients from "./pages/admin/Patients";
import Appointments from "./pages/admin/Appointments";
import Settings from "./pages/admin/Settings";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Unauthorized from "./pages/Unauthorized";
import Billing from "./pages/admin/Billing";
import Profile from "./pages/admin/Profile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminSupport from "./pages/admin/AdminSupport";

// Medical Records & Support
import MedicalRecords from "./pages/MedicalRecords";
import PatientSupport from "./pages/PatientSupport";

function AppContent() {
  const location = useLocation();

  // Check if current path is a dashboard (admin, patient, or doctor)
  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/patient") ||
    location.pathname.startsWith("/doctor");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar hidden only on Dashboard routes */}
      {!isDashboardRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* ── Public Routes ────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Patient Routes ───────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient" element={<PatientLayout />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="doctors" element={<Doctors />} />
              <Route
                path="book-appointment/:doctorId?"
                element={<BookAppointment />}
              />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="medical-records" element={<MedicalRecords />} />
              <Route path="support" element={<PatientSupport />} />
            </Route>
          </Route>

          {/* ── Doctor Routes ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>
          </Route>

          {/* ── Admin Routes ─────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/add" element={<Doctors />} />
              <Route path="patients" element={<Patients />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="billing" element={<Billing />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<AdminSupport />} />
            </Route>
          </Route>

          {/* ── Catch All Route ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer will now render on EVERY page */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;