// src/pages/admin/Settings.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  DollarSign,
  Mail,
  Lock,
  Save,
  X,
  Edit,
  Eye,
  EyeOff,
  Shield,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Bell,
  Palette,
  Globe
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    hospitalName: 'MediCare Hospital',
    hospitalAddress: '123 Healthcare Blvd, Medical District',
    phoneNumber: '+1 234 567 890',
    email: 'info@medicare.com',
    workingHours: {
      start: '09:00',
      end: '18:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    consultationFee: {
      general: 500,
      specialist: 800,
      emergency: 1200
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      username: 'noreply@medicare.com',
      password: '********'
    },
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    theme: {
      primary: '#2563EB',
      secondary: '#10B981'
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'working-hours', label: 'Working Hours', icon: Clock },
    { id: 'fees', label: 'Consultation Fees', icon: DollarSign },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'theme', label: 'Theme', icon: Palette },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSettings();
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.updateSettings(settings);
      if (response.data.success) {
        toast.success('Settings updated successfully');
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Hospital Name
          </label>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-gray-400" />
            <input
              type="text"
              value={settings.hospitalName}
              onChange={(e) => setSettings({...settings, hospitalName: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            <input
              type="text"
              value={settings.phoneNumber}
              onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Hospital Address
        </label>
        <textarea
          value={settings.hospitalAddress}
          onChange={(e) => setSettings({...settings, hospitalAddress: e.target.value})}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-gray-400" />
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({...settings, email: e.target.value})}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderWorkingHours = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Start Time
          </label>
          <input
            type="time"
            value={settings.workingHours.start}
            onChange={(e) => setSettings({
              ...settings,
              workingHours: {...settings.workingHours, start: e.target.value}
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            End Time
          </label>
          <input
            type="time"
            value={settings.workingHours.end}
            onChange={(e) => setSettings({
              ...settings,
              workingHours: {...settings.workingHours, end: e.target.value}
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Working Days
        </label>
        <div className="flex flex-wrap gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <button
              key={day}
              onClick={() => {
                const days = settings.workingHours.days;
                const updated = days.includes(day)
                  ? days.filter(d => d !== day)
                  : [...days, day];
                setSettings({
                  ...settings,
                  workingHours: {...settings.workingHours, days: updated}
                });
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                settings.workingHours.days.includes(day)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConsultationFees = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            General Consultation
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={settings.consultationFee.general}
              onChange={(e) => setSettings({
                ...settings,
                consultationFee: {...settings.consultationFee, general: parseInt(e.target.value)}
              })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Specialist Consultation
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={settings.consultationFee.specialist}
              onChange={(e) => setSettings({
                ...settings,
                consultationFee: {...settings.consultationFee, specialist: parseInt(e.target.value)}
              })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Emergency Consultation
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={settings.consultationFee.emergency}
              onChange={(e) => setSettings({
                ...settings,
                consultationFee: {...settings.consultationFee, emergency: parseInt(e.target.value)}
              })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.smtp.host}
            onChange={(e) => setSettings({
              ...settings,
              smtp: {...settings.smtp, host: e.target.value}
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.smtp.port}
            onChange={(e) => setSettings({
              ...settings,
              smtp: {...settings.smtp, port: parseInt(e.target.value)}
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          SMTP Username
        </label>
        <input
          type="email"
          value={settings.smtp.username}
          onChange={(e) => setSettings({
            ...settings,
            smtp: {...settings.smtp, username: e.target.value}
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          SMTP Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={settings.smtp.password}
            onChange={(e) => setSettings({
              ...settings,
              smtp: {...settings.smtp, password: e.target.value}
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Security Tips</p>
            <p className="text-sm text-yellow-700 mt-1">
              Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Current Password
        </label>
        <input
          type="password"
          placeholder="Enter current password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Email Notifications</p>
          <p className="text-sm text-gray-500">Receive notifications via email</p>
        </div>
        <button
          onClick={() => setSettings({
            ...settings,
            notifications: {...settings.notifications, email: !settings.notifications.email}
          })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            settings.notifications.email ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
            settings.notifications.email ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">SMS Notifications</p>
          <p className="text-sm text-gray-500">Receive notifications via SMS</p>
        </div>
        <button
          onClick={() => setSettings({
            ...settings,
            notifications: {...settings.notifications, sms: !settings.notifications.sms}
          })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            settings.notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
            settings.notifications.sms ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Push Notifications</p>
          <p className="text-sm text-gray-500">Receive push notifications</p>
        </div>
        <button
          onClick={() => setSettings({
            ...settings,
            notifications: {...settings.notifications, push: !settings.notifications.push}
          })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            settings.notifications.push ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
            settings.notifications.push ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>
    </div>
  );

  const renderTheme = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.theme.primary}
              onChange={(e) => setSettings({
                ...settings,
                theme: {...settings.theme, primary: e.target.value}
              })}
              className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={settings.theme.primary}
              onChange={(e) => setSettings({
                ...settings,
                theme: {...settings.theme, primary: e.target.value}
              })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Secondary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.theme.secondary}
              onChange={(e) => setSettings({
                ...settings,
                theme: {...settings.theme, secondary: e.target.value}
              })}
              className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={settings.theme.secondary}
              onChange={(e) => setSettings({
                ...settings,
                theme: {...settings.theme, secondary: e.target.value}
              })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Preview</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: settings.theme.primary }} />
            <span className="text-sm" style={{ color: settings.theme.primary }}>Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: settings.theme.secondary }} />
            <span className="text-sm" style={{ color: settings.theme.secondary }}>Secondary</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'general': return renderGeneralSettings();
      case 'working-hours': return renderWorkingHours();
      case 'fees': return renderConsultationFees();
      case 'email': return renderEmailSettings();
      case 'security': return renderSecurity();
      case 'notifications': return renderNotifications();
      case 'theme': return renderTheme();
      default: return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage hospital settings and configurations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        <p>MediCare Hospital Management System v2.0</p>
        <p className="mt-1">All settings are saved automatically</p>
      </div>
    </motion.div>
  );
};

export default Settings;