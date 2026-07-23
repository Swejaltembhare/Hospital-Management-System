import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Calendar, Activity, Mail, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-headline-lg text-on-surface">Dashboard</h1>
              <p className="text-body-md text-on-surface-variant">
                Welcome back, {user.name}!
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="text-primary" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-1">
                {user.role === 'patient' ? <User size={20} /> : <Stethoscope size={20} />}
                <span className="text-label-md uppercase tracking-wider">Role</span>
              </div>
              <p className="text-title-lg font-semibold capitalize">{user.role}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Activity size={20} />
                <span className="text-label-md uppercase tracking-wider">Status</span>
              </div>
              <p className="text-title-lg font-semibold text-success">Active</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Email</p>
                <p className="text-body-lg font-medium">{user.email}</p>
              </div>
              <Mail className="text-outline" size={20} />
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider">
                  {user.role === 'patient' ? 'Patient ID' : 'Doctor License'}
                </p>
                <p className="text-body-lg font-medium">
                  {user.role === 'patient' ? user.patientId : user.doctorLicense}
                </p>
              </div>
              <span className="text-2xl">{user.role === 'patient' ? '🆔' : '📋'}</span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Member Since</p>
                <p className="text-body-lg font-medium">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="text-outline" size={20} />
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
            <p className="text-body-md text-primary">
              🎉 Your account is fully verified and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;