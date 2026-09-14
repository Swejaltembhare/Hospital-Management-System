import React from "react";
import { Link } from "react-router-dom";
import { HeartPulse, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-10 pb-6 border-t border-slate-800 font-sans mt-auto">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Identity & Summary */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-emerald-600 blur-xs opacity-30 group-hover:opacity-60 transition" />
                <div className="relative w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">
                  MediCare
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                  Hospital Management System
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Integrated healthcare platform for booking doctor consultations, managing patient records, and scheduling appointments seamlessly.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/patient/doctors" className="hover:text-emerald-400 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/patient/appointments" className="hover:text-emerald-400 transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Patient Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support Information */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
              Contact & Support
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="text-emerald-400 mt-0.5 shrink-0" size={15} />
                <span>Nagpur, Hingna Road, 441110</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Phone className="text-emerald-400 shrink-0" size={14} />
                <a href="tel:+18001234567" className="hover:text-emerald-400 transition-colors">
                  +91 7499177681
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Mail className="text-emerald-400 shrink-0" size={14} />
                <a href="mailto:support@medicare-hms.com" className="hover:text-emerald-400 transition-colors">
                  swejaltembhare044@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Clock className="text-emerald-400 shrink-0" size={14} />
                <span>24/7 Patient Services</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} MediCare HMS. All rights reserved.</p>
          <p className="text-slate-400">Healthcare Management Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;