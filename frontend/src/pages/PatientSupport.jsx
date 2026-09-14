import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  HelpCircle,
  Send,
  CheckCircle2,
  Phone,
  AlertTriangle,
  Loader2,
  Check,
  Headphones,
  LifeBuoy,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const PatientSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const supportOptions = [
    {
      id: "general",
      badge: "General",
      title: "General Help",
      description: "Hospital services, timing & general inquiries.",
      prefix: "[General Query] ",
      activeClass: "border-emerald-500 bg-emerald-50/40 text-emerald-900",
      badgeClass: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "appointment",
      badge: "Booking",
      title: "Appointment Help",
      description: "Booking, cancelling or rescheduling visits.",
      prefix: "[Appointment Support] ",
      activeClass: "border-teal-500 bg-teal-50/40 text-teal-900",
      badgeClass: "bg-teal-100 text-teal-700",
    },
    {
      id: "technical",
      badge: "System",
      title: "Technical Support",
      description: "Portal errors, login issues or bugs.",
      prefix: "[Technical Issue] ",
      activeClass: "border-indigo-500 bg-indigo-50/40 text-indigo-900",
      badgeClass: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "emergency",
      badge: "Priority",
      title: "Medical Emergency",
      description: "Immediate urgent assistance & helpline.",
      prefix: "[EMERGENCY] ",
      activeClass: "border-rose-500 bg-rose-50/40 text-rose-900",
      badgeClass: "bg-rose-100 text-rose-700 font-bold animate-pulse",
    },
  ];

  const handleSelectCategory = (option) => {
    setSelectedCategory(option.id);
    if (!subject.startsWith(option.prefix)) {
      setSubject(`${option.prefix}`);
    }
  };

  // Submit patient support ticket payload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error("Please provide both a subject and detailed message");
      return;
    }

    try {
      setSending(true);

      await api.post("/patients/support", {
        subject: subject.trim(),
        message: message.trim(),
        email: user?.email || "patient@medicare.com",
      });

      setSuccess(true);
      setSubject("");
      setMessage("");
      setSelectedCategory("");
      toast.success("Support ticket created successfully!");
    } catch (error) {
      console.error("Support submission error:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/70 pb-16 font-sans">
      
      {/* Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-emerald-700" />
                Help & Support Desk
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Get quick assistance for your medical appointments & queries
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Support Form Workspace */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step 1: Category Selection */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Choose Category
            </h2>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSubject("");
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {supportOptions.map((option) => {
              const isSelected = selectedCategory === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectCategory(option)}
                  className={`text-left bg-white rounded-2xl p-4 border transition-all cursor-pointer relative ${
                    isSelected
                      ? `${option.activeClass} shadow-xs ring-1`
                      : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${option.badgeClass}`}
                    >
                      {option.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {option.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Immediate Helpline Banner */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Need Immediate Help?</p>
                <p className="text-[11px] text-slate-500 font-medium">Direct contact numbers for general inquiries and medical emergency</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:+911234567890"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Desk: +91 12345 67890
              </a>
              <a
                href="tel:108"
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Emergency: 102 / 108
              </a>
            </div>
          </div>
        </section>

        {/* Step 2: Support Ticket Form */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/40">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              2. Describe Your Issue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Submit your detailed message and our desk team will reply to your account email
            </p>
          </div>

          {success ? (
            <div className="p-10 text-center max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ticket Sent Successfully
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                  Your request has been logged. Our administration team will process it shortly.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Submit New Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Need help regarding appointment reschedule"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition text-xs font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Message Details *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or problem clearly..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition resize-none text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-medium">
                  Sending as: <strong className="text-slate-600">{user?.email || "Patient"}</strong>
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

      </main>
    </div>
  );
};

export default PatientSupport;