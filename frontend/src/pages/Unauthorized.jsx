import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-slate-50/60 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6">

        {/* Unauthorized Access Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-5">
          
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Access Denied
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">
              You do not have the required permissions or account role to access this portal page.
            </p>
          </div>

          {/* Action Redirection Controls */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <Link
              to="/"
              className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Unauthorized;