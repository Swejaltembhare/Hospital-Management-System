import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      const { data } = await api.get(`/doctors/${doctorId}`);
      setDoctor(data);
    };
    fetchDoctor();
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await api.post("/appointments", { doctorId, date, timeSlot, reasonForVisit });
      setSuccess("Appointment booked successfully!");
      setTimeout(() => navigate("/my-appointments"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-blue-700 mb-1">
          Book with {doctor.user?.name}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {doctor.specialization} • {doctor.department?.name}
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</p>
        )}
        {success && (
          <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{success}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm mb-1 text-gray-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block text-sm mb-1 text-gray-600">Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mb-4"
          >
            <option value="">Select a slot</option>
            {doctor.availableSlots?.map((slot, i) => (
              <option key={i} value={`${slot.startTime} - ${slot.endTime}`}>
                {slot.day}: {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>

          <label className="block text-sm mb-1 text-gray-600">Reason for Visit</label>
          <textarea
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2 mb-6"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
