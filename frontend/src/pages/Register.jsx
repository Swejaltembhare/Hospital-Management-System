import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Stethoscope, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    patientId: '',
    doctorLicense: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate role-specific fields
    if (formData.role === 'patient' && !formData.patientId) {
      setError('Patient ID is required');
      return;
    }
    if (formData.role === 'doctor' && !formData.doctorLicense) {
      setError('Doctor license is required');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-6 border border-outline-variant/30">
          <Link to="/login" className="inline-flex items-center gap-2 text-label-md text-on-surface-variant hover:text-primary transition-colors mb-4">
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg mx-auto mb-3">
              <span className="text-[32px]">🏥</span>
            </div>
            <h2 className="text-headline-lg text-on-surface mb-1">Join MediPrecise</h2>
            <p className="text-body-md text-on-surface-variant">Start your clinical journey today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface block px-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-soft text-body-md"
                  placeholder="Dr. John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-label-md text-on-surface block px-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-soft text-body-md"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-label-md text-on-surface block px-1">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border-2 transition-soft flex items-center justify-center gap-2 ${
                    formData.role === 'patient'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-outline-variant hover:border-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'patient', doctorLicense: '' }))}
                >
                  <User size={16} />
                  Patient
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border-2 transition-soft flex items-center justify-center gap-2 ${
                    formData.role === 'doctor'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-outline-variant hover:border-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'doctor', patientId: '' }))}
                >
                  <Stethoscope size={16} />
                  Doctor
                </button>
              </div>
            </div>

            {/* Role-specific ID */}
            {formData.role === 'patient' && (
              <div className="space-y-1">
                <label className="text-label-md text-on-surface block px-1" htmlFor="patientId">
                  Patient ID
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">🆔</span>
                  <input
                    id="patientId"
                    name="patientId"
                    type="text"
                    value={formData.patientId}
                    onChange={handleChange}
                    required={formData.role === 'patient'}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-soft text-body-md"
                    placeholder="e.g. PT-12345"
                  />
                </div>
              </div>
            )}

            {formData.role === 'doctor' && (
              <div className="space-y-1">
                <label className="text-label-md text-on-surface block px-1" htmlFor="doctorLicense">
                  Doctor License
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">📋</span>
                  <input
                    id="doctorLicense"
                    name="doctorLicense"
                    type="text"
                    value={formData.doctorLicense}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-soft text-body-md"
                    placeholder="e.g. DOC-98765"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-label-md text-on-surface block px-1" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-soft text-body-md"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-label-md text-on-surface block px-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-soft text-body-md"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary text-title-lg py-3.5 rounded-xl shadow-md hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <UserPlus size={24} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center">
            <p className="text-body-md text-on-surface-variant">
              Already have an account?
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;