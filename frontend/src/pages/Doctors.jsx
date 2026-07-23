import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get("/doctors");
        setDoctors(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading doctors...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Our Doctors</h1>

      {doctors.length === 0 ? (
        <p className="text-gray-500">No doctors available yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-lg shadow p-5 border border-gray-100 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">{doc.user?.name}</h3>
              <p className="text-blue-700 text-sm font-medium">{doc.specialization}</p>
              <p className="text-gray-500 text-sm mt-1">{doc.department?.name}</p>
              <p className="text-gray-500 text-sm">{doc.experienceYears} yrs experience</p>
              <p className="text-gray-700 text-sm mt-2 font-medium">
                Fee: ₹{doc.consultationFee}
              </p>

              <Link
                to={`/book/${doc._id}`}
                className="inline-block mt-4 bg-blue-700 text-white text-sm px-4 py-2 rounded hover:bg-blue-800"
              >
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
