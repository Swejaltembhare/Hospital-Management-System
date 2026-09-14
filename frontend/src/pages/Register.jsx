import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Users,
  Droplet,
  HeartPulse,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Flexible Input Field Sub-Component
const InputField = ({
  icon: Icon,
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  value,
  onChange,
  options,
  className = "",
  ...props
}) => {
  const baseInputClasses =
    "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-xs sm:text-sm text-slate-800 transition duration-150 ease-in-out";

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={baseInputClasses}
            required={required}
            {...props}
          >
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={baseInputClasses}
            placeholder={placeholder}
            required={required}
            {...props}
          />
        )}
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Please enter a valid email address";

    if (!formData.password) errors.password = "Password is required";
    else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(formData.password))
      errors.password = "Password must contain at least 6 characters with letters & numbers";

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth || "2000-01-01",
        gender: formData.gender || "Other",
        bloodGroup: formData.bloodGroup || null,
        accountType: "patient",
      };

      const result = await register(registerData);

      if (result?.success) {
        navigate(`/${result.user.role}/dashboard`);
      } else {
        setError(result?.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : "";

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white shadow-sm mb-1">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Patient Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Fill in your details below to schedule appointments and manage medical records.
          </p>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-emerald-700" />
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                icon={User}
                label="Full Name"
                name="fullName"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
              />
              <InputField
                icon={Mail}
                label="Email Address"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                icon={Phone}
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <InputField
                icon={Users}
                label="Gender"
                name="gender"
                type="select"
                value={formData.gender}
                onChange={handleChange}
                options={["Male", "Female", "Other"]}
              />
            </div>
          </div>

          {/* Section 2: Health Demographics */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Calendar className="h-4 w-4 text-emerald-700" />
              Health Demographics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <InputField
                  icon={Calendar}
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {age !== "" && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                    Calculated Age: {age} years
                  </p>
                )}
              </div>
              <InputField
                icon={Droplet}
                label="Blood Group"
                name="bloodGroup"
                type="select"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              />
            </div>
          </div>

          {/* Section 3: Password Security */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Lock className="h-4 w-4 text-emerald-700" />
              Account Security
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Must contain at least 6 characters with letters and numbers.
            </p>
          </div>

          {/* Action Controls */}
          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;