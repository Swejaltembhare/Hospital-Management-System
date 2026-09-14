import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_CONFIG = {
  pending: {
    color: 'text-amber-500 border-amber-500',
    icon: Clock,
    title: 'Awaiting Confirmation',
    description: 'Your appointment is waiting for doctor confirmation',
  },
  confirmed: {
    color: 'text-cyan-500 border-cyan-500',
    icon: CheckCircle,
    title: 'Confirmed by Doctor',
    description: 'Appointment confirmed. Please arrive on time',
  },
  completed: {
    color: 'text-emerald-500 border-emerald-500',
    icon: CheckCircle,
    title: 'Appointment Completed',
    description: 'Appointment has been completed successfully',
  },
  cancelled: {
    color: 'text-red-500 border-red-500',
    icon: XCircle,
    title: 'Appointment Cancelled',
    description: 'This appointment has been cancelled',
  },
};

const AppointmentStepper = ({ status = 'pending' }) => {
  const normalizedStatus = status?.toLowerCase() || 'pending';

  // Early return for cancelled appointments
  if (normalizedStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-bold text-red-700">Appointment Cancelled</p>
          <p className="text-sm text-red-600">This appointment has been cancelled</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = Math.max(0, STEPS.findIndex((s) => s.key === normalizedStatus));
  const currentConfig = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
  const StatusIcon = currentConfig.icon;

  return (
    <div className="w-full p-4 bg-slate-50 rounded-2xl">
      {/* Progress Track Line and Step Nodes */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
          <div 
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1 : 0.9 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isActive ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </motion.div>

              <span className={`text-xs font-medium mt-2 ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
                {step.label}
              </span>

              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold text-teal-600 mt-0.5"
                >
                  Current
                </motion.span>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Status Context Box */}
      <div className="mt-6 p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3">
        <StatusIcon className={`w-5 h-5 flex-shrink-0 ${currentConfig.color}`} />
        <div>
          <p className="text-sm font-semibold text-slate-900">{currentConfig.title}</p>
          <p className="text-xs text-slate-400">{currentConfig.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStepper;