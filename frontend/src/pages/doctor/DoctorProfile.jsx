import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  GraduationCap,
  Briefcase,
  IndianRupee,
  Star,
  Clock,
  Edit2,
  Save,
  X,
  Languages,
  FileText,
  Loader2,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("professional");
  const [formData, setFormData] = useState({
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    bio: "",
    languages: "",
  });

  // Retrieve current doctor profile details
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctor/profile");
      const doc = response.data.doctor;
      setDoctor(doc);
      setFormData({
        specialization: doc.specialization || "",
        qualification: doc.qualification || "",
        experience: doc.experience ?? "",
        consultationFee: doc.consultationFee ?? "",
        bio: doc.bio || "",
        languages: (doc.languages || []).join(", "),
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit doctor profile changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        bio: formData.bio,
        languages: formData.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      };
      const response = await api.put("/doctor/profile", payload);
      setDoctor(response.data.doctor);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      specialization: doctor?.specialization || "",
      qualification: doctor?.qualification || "",
      experience: doctor?.experience ?? "",
      consultationFee: doctor?.consultationFee ?? "",
      bio: doctor?.bio || "",
      languages: (doctor?.languages || []).join(", "),
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-[1920px] mx-auto space-y-6">
          <div className="w-full h-36 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="w-full min-h-screen bg-slate-50/60 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center max-w-sm w-full">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Profile Not Available</h3>
          <p className="text-xs text-slate-500 mt-1">Unable to retrieve doctor profile details.</p>
          <button
            onClick={fetchProfile}
            className="mt-5 w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const doctorName = doctor.user?.fullName || doctor.fullName || "Doctor";
  const email = doctor.user?.email || doctor.email || "N/A";
  const phone = doctor.user?.phoneNumber || doctor.phoneNumber || "N/A";

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">

        {/* Doctor Profile Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden shadow-md">
                {doctor.user?.profilePhoto ? (
                  <img
                    src={doctor.user.profilePhoto}
                    alt={doctorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-extrabold">
                    {doctorName.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Dr. {doctorName.replace(/^Dr\.\s*/i, "")}
                  </h1>
                </div>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-medium">
                  {doctor.specialization || "Specialist"} • {doctor.department || "General Medicine"}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-emerald-100 font-medium">
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span className="font-bold text-white">{doctor.averageRating || 0}</span>
                    <span className="opacity-80">({doctor.totalRatings || 0} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="self-stretch sm:self-auto flex items-center justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-emerald-50 text-emerald-900 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all font-bold text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-emerald-700" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 flex-1 justify-center cursor-pointer shadow-xs"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all flex-1 justify-center cursor-pointer border border-white/20"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Doctor Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: "Experience", value: `${doctor.experience || 0} Years`, icon: Award, iconBg: "bg-amber-50 text-amber-700" },
            { label: "Average Rating", value: `${doctor.averageRating || 0} ★`, icon: Star, iconBg: "bg-emerald-50 text-emerald-700" },
            { label: "Consultation Fee", value: `₹${doctor.consultationFee || 0}`, icon: IndianRupee, iconBg: "bg-teal-50 text-teal-700" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs Header */}
        <div className="bg-white rounded-3xl p-2 border border-slate-100 flex gap-2 overflow-x-auto shadow-sm">
          {[
            { id: "professional", label: "Professional Info", icon: Stethoscope },
            { id: "contact", label: "Contact Details", icon: Mail },
            { id: "availability", label: "Availability", icon: Clock },
            { id: "reviews", label: "Reviews", icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Tab Panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "professional" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Professional Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" /> Department
                    </label>
                    <p className="text-sm font-bold text-slate-900">{doctor.department || "General Medicine"}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Stethoscope className="w-4 h-4 text-slate-400" /> Specialization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{formData.specialization || "Not specified"}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> Qualification
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{formData.qualification || "Not specified"}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" /> Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{formData.experience || 0} years</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <IndianRupee className="w-4 h-4 text-slate-400" /> Consultation Fee
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-900">₹{formData.consultationFee || 0}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Languages className="w-4 h-4 text-slate-400" /> Languages
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-900">
                        {(doctor.languages || []).join(", ") || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-4 h-4 text-slate-400" /> Biography
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-700 font-medium">{formData.bio || "No biography written yet."}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" /> Email Address
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{email}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" /> Contact Phone
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{phone}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "availability" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Active Slots
                </h2>
                {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {doctor.availableSlots.map((slot, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">{slot.day}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-semibold">No availability slots set.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Patient Feedback
                </h2>
                {doctor.ratings && doctor.ratings.length > 0 ? (
                  <div className="space-y-3">
                    {doctor.ratings.map((r, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{r.patient?.user?.fullName || r.patient?.fullName || "Anonymous"}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                            ))}
                          </div>
                        </div>
                        {r.review && <p className="text-slate-600 font-medium">{r.review}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-semibold">No patient reviews yet.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DoctorProfile;