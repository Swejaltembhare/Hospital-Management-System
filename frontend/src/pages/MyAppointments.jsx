import { useEffect, useState } from "react";
import api from "../services/api";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await api.get("/appointments/my");
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    await api.put(`/appointments/${id}/cancel`);
    fetchAppointments();
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">My Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments booked yet.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {appt.doctor?.user?.name}
                  </h3>
                  <p className="text-sm text-gray-500">{appt.doctor?.department?.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(appt.date).toLocaleDateString()} • {appt.timeSlot}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${statusColors[appt.status]}`}
                >
                  {appt.status}
                </span>
              </div>

              {appt.prescription?.diagnosis && (
                <div className="mt-3 text-sm bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-700">Diagnosis: {appt.prescription.diagnosis}</p>
                  {appt.prescription.notes && (
                    <p className="text-gray-600 mt-1">{appt.prescription.notes}</p>
                  )}
                </div>
              )}

              {["pending", "confirmed"].includes(appt.status) && (
                <button
                  onClick={() => handleCancel(appt._id)}
                  className="mt-3 text-sm text-red-600 hover:underline"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
