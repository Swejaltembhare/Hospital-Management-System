import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  Calendar,
  Stethoscope,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch completed consultation records
  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);

      const response = await api.get("/patients/appointments?limit=100");

      const appointments = response.data?.appointments || [];
      const completedAppointments = appointments
        .filter((apt) => apt.status?.toLowerCase() === "completed")
        .map((apt) => ({
          id: apt._id,
          date: apt.date,
          doctor:
            apt.doctor?.user?.fullName || apt.doctor?.fullName || "Doctor",
          specialization: apt.doctor?.specialization || "General Medicine",
          department: apt.department || apt.doctor?.department || "Outpatient",
          reason: apt.reason || apt.symptoms || "Regular Checkup",
          diagnosis: apt.diagnosis || apt.notes || "",
          status: apt.status,
        }));

      setRecords(completedAppointments);
    } catch (error) {
      console.error("Medical records fetch error:", error);
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMedicalRecords();
    toast.success("Records updated");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin" />
        <p className="text-slate-600 font-medium text-sm">
          Retrieving your health records...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      
      {/* Navigation Top Bar */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                Medical Records
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                View your complete consultation history and visit summaries
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* Medical Records Main Feed */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {records.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm max-w-lg mx-auto my-8 space-y-3">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                No Consultation Records
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Your completed appointment history will appear here once consultations are done.
              </p>
            </div>
            <Link
              to="/book-appointment"
              className="inline-block mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Book Consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Dr. {record.doctor.replace(/^Dr\.\s*/i, "")}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                      {record.specialization}{" "}
                      {record.department ? `• ${record.department}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(record.date)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Reason for Visit
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {record.reason}
                    </p>
                  </div>

                  {record.diagnosis && (
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/60">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                        Diagnosis / Notes
                      </span>
                      <p className="text-xs font-semibold text-slate-800 mt-1">
                        {record.diagnosis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default MedicalRecords;