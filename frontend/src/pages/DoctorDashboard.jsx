import { useEffect, useState } from "react";
import api from "../services/api";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await api.get("/doctors/me/appointments");
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/doctors/appointments/${id}`, { status });
    fetchAppointments();
  };

  const savePrescription = async (id) => {
    await api.put(`/doctors/appointments/${id}`, {
      status: "completed",
      prescription: { diagnosis, notes, medicines: [] },
    });
    setEditingId(null);
    setDiagnosis("");
    setNotes("");
    fetchAppointments();
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">My Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{appt.patient?.name}</h3>
                  <p className="text-sm text-gray-500">{appt.patient?.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(appt.date).toLocaleDateString()} • {appt.timeSlot}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {appt.reasonForVisit || "-"}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {appt.status}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                {appt.status === "pending" && (
                  <button
                    onClick={() => updateStatus(appt._id, "confirmed")}
                    className="text-sm bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
                  >
                    Confirm
                  </button>
                )}
                {appt.status !== "completed" && appt.status !== "cancelled" && (
                  <button
                    onClick={() => setEditingId(appt._id)}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Add Prescription & Complete
                  </button>
                )}
              </div>

              {editingId === appt._id && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <label className="block text-sm mb-1 text-gray-600">Diagnosis</label>
                  <input
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-3"
                  />
                  <label className="block text-sm mb-1 text-gray-600">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full border rounded px-3 py-2 mb-3"
                  />
                  <button
                    onClick={() => savePrescription(appt._id)}
                    className="text-sm bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                  >
                    Save & Mark Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
