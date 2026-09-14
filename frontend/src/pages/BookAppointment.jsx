import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  User,
  Stethoscope,
  Award,
  Star,
  CheckCircle,
  Search,
  Filter,
  Loader2,
  Check,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();

  // Core Booking States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [departments, setDepartments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    gender: "All",
    experience: "All",
    availableToday: false,
    minRating: 0,
    sortBy: "rating",
  });

  // Booking Form Fields State
  const [formData, setFormData] = useState({
    patientName: user?.fullName || "",
    patientEmail: user?.email || "",
    patientPhone: user?.phoneNumber || user?.phone || "",
    doctor: "",
    department: "",
    date: "",
    timeSlot: "",
    appointmentType: "physical",
    reason: "",
    symptoms: "",
    notes: "",
  });

  // Fetch active doctors list from API
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors");

      let doctorsData =
        response.data.doctors ||
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);

      const activeDoctors = doctorsData.filter(
        (doc) => doc.status === "active" || doc.status === "approved" || !doc.status,
      );

      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);

      const depts = [
        ...new Set(
          activeDoctors
            .map((doc) => doc.department || doc.specialization)
            .filter(Boolean),
        ),
      ];
      setDepartments(depts);

      if (doctorId) {
        const doctor = activeDoctors.find((doc) => doc._id === doctorId);
        if (doctor) {
          setSelectedDoctor(doctor);
          setFormData((prev) => ({
            ...prev,
            doctor: doctor._id,
            department: doctor.department || doctor.specialization || "",
          }));
          setShowBookingForm(true);
        }
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors list");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Fetch available slots on date or doctor change
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !formData.date || !showBookingForm) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const response = await api.get(
          `/doctors/available-slots/${selectedDoctor._id}`,
          {
            params: { date: formData.date },
          },
        );

        const rawSlots =
          response.data.slots ||
          response.data.availableSlots ||
          response.data ||
          [];

        const normalized = rawSlots.map((slot) => {
          if (typeof slot === "string") {
            return { time: slot, booked: false };
          }
          return {
            time:
              slot.time ||
              slot.startTime ||
              `${slot.startTime} - ${slot.endTime}`,
            booked: !!slot.booked || !!slot.isBooked,
          };
        });

        setAvailableSlots(normalized);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
        toast.error("Could not load slots for the selected date");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, formData.date, showBookingForm]);

  // Filter doctors by search query and category parameters
  useEffect(() => {
    let filtered = [...doctors];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.fullName?.toLowerCase().includes(term) ||
          doc.user?.fullName?.toLowerCase().includes(term) ||
          doc.specialization?.toLowerCase().includes(term) ||
          doc.department?.toLowerCase().includes(term),
      );
    }

    if (selectedDepartment !== "All") {
      filtered = filtered.filter(
        (doc) =>
          doc.department === selectedDepartment ||
          doc.specialization === selectedDepartment,
      );
    }

    if (filters.gender !== "All") {
      filtered = filtered.filter(
        (doc) => (doc.gender || doc.user?.gender) === filters.gender,
      );
    }

    if (filters.experience !== "All") {
      filtered = filtered.filter(
        (doc) => (doc.experience || 0) >= parseInt(filters.experience),
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedDepartment, doctors, filters]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData((prev) => ({
      ...prev,
      doctor: doctor._id,
      department: doctor.department || doctor.specialization || "",
    }));
    setShowBookingForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date" ? { timeSlot: "" } : {}),
    }));
  };

  // Submit appointment payload to backend API
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.doctor ||
      !formData.date ||
      !formData.timeSlot ||
      !formData.reason
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...formData, doctorId: formData.doctor };
      const response = await api.post("/patients/appointments", payload);

      setBookingData(response.data.appointment);
      setShowSuccessModal(true);
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to book appointment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <BookingSkeleton />;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Book Appointment Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {showBookingForm ? "Confirm Your Visit" : "Book Appointment"}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
              {showBookingForm
                ? "Fill in the required information to schedule your consultation."
                : "Find top specialists and schedule your appointment seamlessly."}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Dynamic Booking Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className={`${showBookingForm ? "xl:col-span-8" : "xl:col-span-12"} space-y-6`}>
            {!showBookingForm ? (
              <>
                <SearchFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  departments={departments}
                  filters={filters}
                  setFilters={setFilters}
                />
                <DoctorsGrid
                  doctors={filteredDoctors}
                  onSelectDoctor={handleDoctorSelect}
                  selectedDoctorId={selectedDoctor?._id}
                />
              </>
            ) : (
              <BookingForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleBookingSubmit}
                submitting={submitting}
                selectedDoctor={selectedDoctor}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
                onBack={() => setShowBookingForm(false)}
              />
            )}
          </div>

          {showBookingForm && (
            <div className="xl:col-span-4">
              <AppointmentSummary 
                selectedDoctor={selectedDoctor} 
                formData={formData} 
              />
            </div>
          )}
        </div>
      </main>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingData={bookingData}
      />
    </div>
  );
};

// Search & Specialty Filter Controls Sub-Component
const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  departments,
  filters,
  setFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor, specialty, or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none font-semibold text-slate-700"
          >
            <option value="All">All Specialties</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 border rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showAdvanced
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Doctors List Display Sub-Component
const DoctorsGrid = ({ doctors, onSelectDoctor, selectedDoctorId }) => {
  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">
          No Doctors Match Your Search
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map((doctor) => {
        const isSelected = selectedDoctorId === doctor._id;
        const name = doctor.user?.fullName || doctor.fullName || "Doctor";

        const currentRating =
          doctor.averageRating !== undefined && doctor.averageRating !== null && doctor.averageRating > 0
            ? Number(doctor.averageRating).toFixed(1)
            : doctor.rating !== undefined && doctor.rating !== null && doctor.rating > 0
            ? Number(doctor.rating).toFixed(1)
            : "0.0";

        return (
          <div
            key={doctor._id}
            className={`bg-white rounded-2xl border transition shadow-xs p-4 flex flex-col justify-between space-y-4 ${
              isSelected
                ? "border-emerald-500 ring-2 ring-emerald-500/10"
                : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                {doctor.user?.profilePhoto || doctor.profilePhoto ? (
                  <img
                    src={doctor.user?.profilePhoto || doctor.profilePhoto}
                    alt={name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  Dr. {name.replace(/^Dr\.\s*/i, "")}
                </h3>
                <p className="text-xs text-emerald-600 font-semibold truncate">
                  {doctor.specialization || "General Physician"}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />{" "}
                    {doctor.experience || 0} yrs
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{" "}
                    {currentRating}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">
                  Consultation Fee
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{doctor.consultationFee || 500}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectDoctor(doctor)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : "Select"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Appointment Details Form Sub-Component
const BookingForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  submitting,
  selectedDoctor,
  availableSlots,
  loadingSlots,
  onBack,
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
      <h2 className="font-bold text-slate-900 text-sm sm:text-base">
        Appointment Details
      </h2>
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
      >
        Change Doctor
      </button>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Patient Name *
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Select Date *
        </label>
        <div className="relative">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-800 font-semibold cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Available Time Slots *
        </label>

        {loadingSlots ? (
          <div className="p-3 bg-slate-50 text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            Checking available slots...
          </div>
        ) : !formData.date ? (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl font-medium">
            Please select a date to view available time slots.
          </p>
        ) : availableSlots.length === 0 ? (
          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl font-medium border border-rose-100">
            No available time slots for the selected date. Please try selecting a different day.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableSlots.map((slot, index) => (
              <button
                key={`${slot.time}-${index}`}
                type="button"
                disabled={slot.booked}
                onClick={() =>
                  handleInputChange({
                    target: {
                      name: "timeSlot",
                      value: slot.time,
                    },
                  })
                }
                className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  slot.booked
                    ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through"
                    : formData.timeSlot === slot.time
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                      : "bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Reason for Visit *
        </label>
        <textarea
          name="reason"
          rows="2"
          value={formData.reason}
          onChange={handleInputChange}
          required
          placeholder="Briefly describe your main health concern..."
          className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 resize-none font-medium text-slate-800"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Confirm & Book Appointment
      </button>
    </form>
  </div>
);

// Selection Summary Sidebar Sub-Component
const AppointmentSummary = ({ selectedDoctor, formData }) => {
  if (!selectedDoctor) return null;

  const docName =
    selectedDoctor.user?.fullName || selectedDoctor.fullName || "Doctor";
  const total = selectedDoctor.consultationFee || 500;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4 sticky top-20">
      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
        Summary
      </h3>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Doctor</span>
          <span className="font-bold text-slate-800">
            Dr. {docName.replace(/^Dr\.\s*/i, "")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Specialty</span>
          <span className="font-semibold text-slate-700">
            {selectedDoctor.specialization || "General"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Date</span>
          <span className="font-semibold text-slate-700">
            {formData.date || "Not set"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Time</span>
          <span className="font-semibold text-slate-700">
            {formData.timeSlot || "Not set"}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1">
          <span>Total Payable Amount</span>
          <span className="text-emerald-700">₹{total}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-2 font-medium">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Secure consultation backed by trusted care</span>
      </div>
    </div>
  );
};

// Booking Confirmation Success Modal Sub-Component
const SuccessModal = ({ isOpen, onClose, bookingData }) => {
  if (!isOpen || !bookingData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-xl space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base">
            Booking Confirmed!
          </h2>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to="/patient/appointments"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold block transition text-center cursor-pointer"
          >
            My Appointments
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold block transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Placeholder Component
const BookingSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50/60 p-6 flex flex-col items-center justify-center">
    <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mb-2" />
    <p className="text-xs font-semibold text-slate-500">
      Loading booking workspace...
    </p>
  </div>
);

export default BookAppointment;