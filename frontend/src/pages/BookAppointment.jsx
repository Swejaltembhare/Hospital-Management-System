// // src/pages/BookAppointment.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../context/AuthContext';
// import {
//   Calendar,
//   Clock,
//   User,
//   Stethoscope,
//   MapPin,
//   Building,
//   Award,
//   Star,
//   Phone,
//   Video,
//   CheckCircle,
//   X,
//   Search,
//   Filter,
//   ChevronDown,
//   Heart,
//   FileText,
//   MessageSquare,
//   CalendarDays,
//   Sparkles,
//   Loader2,
//   Check,
//   Download,
//   Languages,
//   Users,
//   Briefcase,
//   DollarSign,
//   Clock as ClockIcon,
//   Calendar as CalendarIcon,
//   UserCircle,
//   Hospital,
//   Shield,
//   AlertCircle,
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import axios from 'axios';

// const BookAppointment = () => {
//   const { doctorId } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // States
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [doctors, setDoctors] = useState([]);
//   const [filteredDoctors, setFilteredDoctors] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('All');
//   const [departments, setDepartments] = useState([]);
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [bookingData, setBookingData] = useState(null);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [filters, setFilters] = useState({
//     gender: 'All',
//     experience: 'All',
//     availableToday: false,
//     minRating: 0,
//     sortBy: 'rating',
//   });

//   // Booking Form State
//   const [formData, setFormData] = useState({
//     patientName: user?.fullName || '',
//     patientEmail: user?.email || '',
//     patientPhone: user?.phone || '',
//     doctor: '',
//     department: '',
//     date: '',
//     timeSlot: '',
//     appointmentType: 'physical',
//     reason: '',
//     symptoms: '',
//     notes: '',
//   });

//   // Fetch doctors from backend
//   const fetchDoctors = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');

//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/doctors`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log('Doctor API Response:', response.data);

//       // Handle different response structures
//       let doctorsData = [];
//       if (response.data.doctors) doctorsData = response.data.doctors;
//       else if (Array.isArray(response.data)) doctorsData = response.data;
//       else if (response.data.data) doctorsData = response.data.data;

//       // Filter only active/approved doctors
//       const activeDoctors = doctorsData.filter(
//         (doc) => doc.status === 'active' || doc.status === 'approved' || !doc.status
//       );

//       console.log('Active Doctors:', activeDoctors);

//       setDoctors(activeDoctors);
//       setFilteredDoctors(activeDoctors);

//       // Extract unique departments
//       const depts = [...new Set(activeDoctors.map((doc) => doc.department || doc.specialization).filter(Boolean))];
//       setDepartments(depts);

//       // If doctorId is provided, select that doctor
//       if (doctorId) {
//         const doctor = activeDoctors.find((doc) => doc._id === doctorId);
//         if (doctor) {
//           setSelectedDoctor(doctor);
//           setFormData((prev) => ({
//             ...prev,
//             doctor: doctor._id,
//             department: doctor.department || doctor.specialization || '',
//           }));
//           setShowBookingForm(true);
//         }
//       }

//     } catch (error) {
//       console.error('Error fetching doctors:', error);
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', error.response.data);
//       }
//       toast.error('Failed to load doctors. Please try again.');
//       setDoctors([]);
//       setFilteredDoctors([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [doctorId]);

//   useEffect(() => {
//     fetchDoctors();
//   }, [fetchDoctors]);

//   // Fetch available slots when doctor and date are selected
//   useEffect(() => {
//     const fetchAvailableSlots = async () => {
//       if (!selectedDoctor || !formData.date) {
//         setAvailableSlots([]);
//         return;
//       }

//       try {
//         setLoadingSlots(true);
//         const token = localStorage.getItem('token');
//         const response = await axios.get(
//           `${import.meta.env.VITE_API_URL}/doctors/available-slots/${selectedDoctor._id}`,
//           {
//             params: { date: formData.date },
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         setAvailableSlots(response.data.slots || []);
//       } catch (error) {
//         console.error('Error fetching available slots:', error);
//         setAvailableSlots([]);
//         toast.error('Failed to load available slots');
//       } finally {
//         setLoadingSlots(false);
//       }
//     };

//     fetchAvailableSlots();
//   }, [selectedDoctor, formData.date]);

//   // Filter and sort doctors
//   useEffect(() => {
//     let filtered = [...doctors];

//     // Search filter
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (doc) =>
//           doc.fullName?.toLowerCase().includes(term) ||
//           doc.specialization?.toLowerCase().includes(term) ||
//           doc.department?.toLowerCase().includes(term) ||
//           doc.hospital?.toLowerCase().includes(term) ||
//           doc.location?.toLowerCase().includes(term)
//       );
//     }

//     // Department filter
//     if (selectedDepartment !== 'All') {
//       filtered = filtered.filter(
//         (doc) =>
//           doc.department === selectedDepartment ||
//           doc.specialization === selectedDepartment
//       );
//     }

//     // Gender filter
//     if (filters.gender !== 'All') {
//       filtered = filtered.filter((doc) => doc.gender === filters.gender);
//     }

//     // Experience filter
//     if (filters.experience !== 'All') {
//       const exp = parseInt(filters.experience);
//       filtered = filtered.filter((doc) => (doc.experience || 0) >= exp);
//     }

//     // Available today filter
//     if (filters.availableToday) {
//       filtered = filtered.filter((doc) => doc.isAvailable !== false);
//     }

//     // Rating filter
//     if (filters.minRating > 0) {
//       filtered = filtered.filter((doc) => (doc.rating || 0) >= filters.minRating);
//     }

//     // Sort
//     switch (filters.sortBy) {
//       case 'rating':
//         filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//         break;
//       case 'fee':
//         filtered.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
//         break;
//       case 'experience':
//         filtered.sort((a, b) => (b.experience || 0) - (a.experience || 0));
//         break;
//       default:
//         break;
//     }

//     setFilteredDoctors(filtered);
//   }, [searchTerm, selectedDepartment, doctors, filters]);

//   const handleDoctorSelect = (doctor) => {
//     setSelectedDoctor(doctor);
//     setFormData((prev) => ({
//       ...prev,
//       doctor: doctor._id,
//       department: doctor.department || doctor.specialization || '',
//     }));
//     setShowBookingForm(true);
//     // Scroll to booking form
//     setTimeout(() => {
//       document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
//     }, 100);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     // Reset time slot when date changes
//     if (name === 'date') {
//       setFormData((prev) => ({ ...prev, timeSlot: '' }));
//     }
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const resetFilters = () => {
//     setSearchTerm('');
//     setSelectedDepartment('All');
//     setFilters({
//       gender: 'All',
//       experience: 'All',
//       availableToday: false,
//       minRating: 0,
//       sortBy: 'rating',
//     });
//   };

//   const handleTimeSlotSelect = (slot) => {
//     if (slot.booked) return;
//     setFormData((prev) => ({ ...prev, timeSlot: slot.time }));
//   };

//   const handleBookingSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.doctor) {
//       toast.error('Please select a doctor');
//       return;
//     }
//     if (!formData.date) {
//       toast.error('Please select a date');
//       return;
//     }
//     if (!formData.timeSlot) {
//       toast.error('Please select a time slot');
//       return;
//     }
//     if (!formData.reason) {
//       toast.error('Please provide a reason for visit');
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         doctorId: formData.doctor,
//         date: formData.date,
//         timeSlot: formData.timeSlot,
//         appointmentType: formData.appointmentType,
//         reason: formData.reason,
//         symptoms: formData.symptoms,
//         notes: formData.notes,
//         patientName: formData.patientName,
//         patientEmail: formData.patientEmail,
//         patientPhone: formData.patientPhone,
//       };

//       const response = await axios.post(
//         `${import.meta.env.VITE_API_URL}/patients/appointments`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setBookingData(response.data.appointment);
//       setShowSuccessModal(true);
//       toast.success('Appointment booked successfully!');

//     } catch (error) {
//       console.error('Error booking appointment:', error);
//       toast.error(error.response?.data?.message || 'Failed to book appointment');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return 'D';
//     return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   if (loading) {
//     return <BookingSkeleton />;
//   }

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 pb-12">
//       <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6">
//         {/* Hero Section */}
//         <HeroSection />

//         {/* Main Content */}
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
//           {/* Left Column */}
//           <div className="xl:col-span-8 2xl:col-span-8 space-y-6">
//             {/* Search & Filters */}
//             <SearchFilters
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//               selectedDepartment={selectedDepartment}
//               setSelectedDepartment={setSelectedDepartment}
//               departments={departments}
//               filters={filters}
//               handleFilterChange={handleFilterChange}
//               resetFilters={resetFilters}
//             />

//             {/* Doctors Grid or Booking Form */}
//             {!showBookingForm ? (
//               <DoctorsGrid
//                 doctors={filteredDoctors}
//                 onSelectDoctor={handleDoctorSelect}
//                 selectedDoctorId={selectedDoctor?._id}
//               />
//             ) : (
//               <BookingForm
//                 formData={formData}
//                 handleInputChange={handleInputChange}
//                 handleSubmit={handleBookingSubmit}
//                 submitting={submitting}
//                 selectedDoctor={selectedDoctor}
//                 availableSlots={availableSlots}
//                 loadingSlots={loadingSlots}
//                 onBack={() => {
//                   setShowBookingForm(false);
//                   setSelectedDoctor(null);
//                   setAvailableSlots([]);
//                 }}
//                 handleTimeSlotSelect={handleTimeSlotSelect}
//               />
//             )}
//           </div>

//           {/* Right Column - Sticky Summary */}
//           <div className="xl:col-span-4 2xl:col-span-4">
//             <AppointmentSummary
//               selectedDoctor={selectedDoctor}
//               formData={formData}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Success Modal */}
//       <SuccessModal
//         isOpen={showSuccessModal}
//         onClose={() => setShowSuccessModal(false)}
//         bookingData={bookingData}
//       />
//     </div>
//   );
// };

// // ==================== COMPONENTS ====================

// const HeroSection = () => (
//   <motion.div
//     initial={{ opacity: 0, y: -20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5 }}
//     className="relative"
//   >
//     <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl shadow-blue-600/20">
//       <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
//       <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
//       <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
//       <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//         <div className="space-y-2">
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
//             <Calendar className="w-8 h-8 text-blue-300" />
//             Book Appointment
//           </h1>
//           <p className="text-blue-100 text-xs sm:text-sm lg:text-base">
//             Choose your preferred doctor, date and time for a seamless healthcare experience.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
//           <div className="flex items-center gap-2">
//             <CalendarDays className="w-5 h-5 text-amber-300" />
//             <div>
//               <p className="text-white text-xs font-bold">Today's Date</p>
//               <p className="text-blue-200 text-[11px]">
//                 {new Date().toLocaleDateString('en-US', {
//                   day: '2-digit',
//                   month: 'short',
//                   year: 'numeric',
//                 })}
//               </p>
//             </div>
//           </div>
//           <div className="w-px h-8 bg-white/20"></div>
//           <div className="flex items-center gap-2">
//             <Stethoscope className="w-5 h-5 text-emerald-300" />
//             <div>
//               <p className="text-white text-xs font-bold">Department</p>
//               <p className="text-blue-200 text-[11px]">Select a department</p>
//             </div>
//           </div>
//           <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
//           <div className="flex items-center gap-2">
//             <User className="w-5 h-5 text-blue-300" />
//             <div>
//               <p className="text-white text-xs font-bold">Doctor</p>
//               <p className="text-blue-200 text-[11px]">Choose a doctor</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </motion.div>
// );

// const SearchFilters = ({
//   searchTerm,
//   setSearchTerm,
//   selectedDepartment,
//   setSelectedDepartment,
//   departments,
//   filters,
//   handleFilterChange,
//   resetFilters,
// }) => {
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.1 }}
//       className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
//     >
//       <div className="flex flex-col gap-3">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <input
//               type="text"
//               placeholder="Search by doctor name, specialization, department, or hospital..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
//             />
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             <select
//               value={selectedDepartment}
//               onChange={(e) => setSelectedDepartment(e.target.value)}
//               className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
//             >
//               <option value="All">All Departments</option>
//               {departments.map((dept) => (
//                 <option key={dept} value={dept}>{dept}</option>
//               ))}
//             </select>
//             <button
//               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//               className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 text-sm font-medium ${
//                 showAdvancedFilters
//                   ? 'bg-blue-50 border-blue-200 text-blue-600'
//                   : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
//               }`}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//               {(filters.gender !== 'All' || filters.experience !== 'All' || filters.availableToday || filters.minRating > 0) && (
//                 <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
//               )}
//             </button>
//             <select
//               value={filters.sortBy}
//               onChange={(e) => handleFilterChange('sortBy', e.target.value)}
//               className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
//             >
//               <option value="rating">Sort: Highest Rating</option>
//               <option value="fee">Sort: Lowest Fee</option>
//               <option value="experience">Sort: Most Experienced</option>
//             </select>
//             {(searchTerm || selectedDepartment !== 'All' || filters.gender !== 'All' || filters.experience !== 'All' || filters.availableToday || filters.minRating > 0) && (
//               <button
//                 onClick={resetFilters}
//                 className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium text-red-600 flex items-center gap-1"
//               >
//                 <X className="w-4 h-4" />
//                 Reset
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         <AnimatePresence>
//           {showAdvancedFilters && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//               className="overflow-hidden"
//             >
//               <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
//                   <select
//                     value={filters.gender}
//                     onChange={(e) => handleFilterChange('gender', e.target.value)}
//                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="All">All</option>
//                     <option value="Male">Male</option>
//                     <option value="Female">Female</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1">Experience</label>
//                   <select
//                     value={filters.experience}
//                     onChange={(e) => handleFilterChange('experience', e.target.value)}
//                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="All">Any</option>
//                     <option value="5">5+ years</option>
//                     <option value="10">10+ years</option>
//                     <option value="15">15+ years</option>
//                     <option value="20">20+ years</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 mb-1">Rating</label>
//                   <select
//                     value={filters.minRating}
//                     onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
//                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="0">Any</option>
//                     <option value="3">3+ Stars</option>
//                     <option value="4">4+ Stars</option>
//                     <option value="4.5">4.5+ Stars</option>
//                   </select>
//                 </div>
//                 <div className="flex items-end">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={filters.availableToday}
//                       onChange={(e) => handleFilterChange('availableToday', e.target.checked)}
//                       className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
//                     />
//                     <span className="text-sm font-medium text-slate-700">Available Today</span>
//                   </label>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// };

// const DoctorsGrid = ({ doctors, onSelectDoctor, selectedDoctorId }) => {
//   const getInitials = (name) => {
//     if (!name) return 'D';
//     return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   if (doctors.length === 0) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center"
//       >
//         <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Stethoscope className="w-10 h-10 text-slate-400" />
//         </div>
//         <h3 className="text-xl font-bold text-slate-700">No Doctors Available</h3>
//         <p className="text-sm text-slate-500 mt-2">
//           {doctors.length === 0 && doctors.length === 0
//             ? 'No doctors are currently available. Please check back later.'
//             : 'Try adjusting your search filters'}
//         </p>
//         {doctors.length === 0 && (
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20"
//           >
//             Refresh
//           </button>
//         )}
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//       className="grid grid-cols-1 md:grid-cols-2 gap-5"
//     >
//       {doctors.map((doctor, index) => {
//         const isSelected = selectedDoctorId === doctor._id;
//         return (
//           <motion.div
//             key={doctor._id || index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: index * 0.05 }}
//             whileHover={{ y: -6, transition: { duration: 0.2 } }}
//             className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 overflow-hidden group ${
//               isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-100'
//             }`}
//           >
//             <div className="p-5">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 relative">
//                   {doctor.profilePhoto ? (
//                     <img
//                       src={doctor.profilePhoto}
//                       alt={doctor.fullName}
//                       className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100"
//                     />
//                   ) : (
//                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold ring-4 ring-blue-100">
//                       {getInitials(doctor.fullName)}
//                     </div>
//                   )}
//                   {isSelected && (
//                     <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white">
//                       <Check className="w-3.5 h-3.5 text-white" />
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-bold text-slate-900 text-base truncate">
//                     {doctor.fullName}
//                   </h3>
//                   <p className="text-sm text-blue-600 font-medium truncate">
//                     {doctor.specialization || doctor.department || 'General Physician'}
//                   </p>
//                   <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
//                     <span className="flex items-center gap-1">
//                       <Award className="w-3.5 h-3.5 text-amber-500" />
//                       {doctor.experience || 0} yrs
//                     </span>
//                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
//                     <span className="flex items-center gap-1">
//                       <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
//                       {doctor.rating || '4.5'}
//                     </span>
//                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
//                     <span className="flex items-center gap-1">
//                       <MapPin className="w-3.5 h-3.5" />
//                       {doctor.hospital || 'City Hospital'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
//                     doctor.isAvailable !== false
//                       ? 'bg-emerald-100 text-emerald-700'
//                       : 'bg-red-100 text-red-700'
//                   }`}>
//                     {doctor.isAvailable !== false ? 'Available Today' : 'Unavailable'}
//                   </span>
//                   <span className="text-xs font-bold text-slate-700">
//                     ₹{doctor.consultationFee || 500}
//                   </span>
//                 </div>
//                 <span className="text-[10px] text-slate-400">
//                   {doctor.patientsTreated || 0} patients
//                 </span>
//               </div>

//               {doctor.languages && doctor.languages.length > 0 && (
//                 <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
//                   <Languages className="w-3 h-3" />
//                   <span>{doctor.languages.join(', ')}</span>
//                 </div>
//               )}

//               {doctor.about && (
//                 <p className="mt-2 text-xs text-slate-500 line-clamp-2">{doctor.about}</p>
//               )}

//               <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
//                 <button
//                   onClick={() => onSelectDoctor(doctor)}
//                   className={`flex-1 px-4 py-2.5 rounded-xl transition-colors text-xs font-bold text-center flex items-center justify-center gap-1.5 ${
//                     isSelected
//                       ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
//                       : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
//                   }`}
//                 >
//                   {isSelected ? (
//                     <>
//                       <Check className="w-3.5 h-3.5" />
//                       Selected
//                     </>
//                   ) : (
//                     <>
//                       <Calendar className="w-3.5 h-3.5" />
//                       Select Doctor
//                     </>
//                   )}
//                 </button>
//                 <Link
//                   to={`/patient/doctor-profile/${doctor._id}`}
//                   className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-bold"
//                 >
//                   View Profile
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         );
//       })}
//     </motion.div>
//   );
// };

// const BookingForm = ({
//   formData,
//   handleInputChange,
//   handleSubmit,
//   submitting,
//   selectedDoctor,
//   availableSlots,
//   loadingSlots,
//   onBack,
//   handleTimeSlotSelect,
// }) => {
//   return (
//     <motion.div
//       id="booking-form"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
//     >
//       <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-transparent">
//         <div className="flex items-center gap-2">
//           <Calendar className="w-5 h-5 text-blue-600" />
//           <h2 className="text-lg font-bold text-slate-900">Appointment Details</h2>
//         </div>
//         <button
//           onClick={onBack}
//           className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
//         >
//           <X className="w-3.5 h-3.5" />
//           Back
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} className="p-6 space-y-5">
//         {/* Patient Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Patient Name <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <input
//                 type="text"
//                 name="patientName"
//                 value={formData.patientName}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 placeholder="Enter patient name"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Phone <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <input
//                 type="tel"
//                 name="patientPhone"
//                 value={formData.patientPhone}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 placeholder="Enter phone number"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Doctor & Department (Read Only) */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Selected Doctor <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={selectedDoctor ? selectedDoctor.fullName: 'Not selected'}
//                 disabled
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Department
//             </label>
//             <div className="relative">
//               <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={formData.department}
//                 disabled
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Date & Time */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Appointment Date <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <input
//                 type="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleInputChange}
//                 required
//                 min={new Date().toISOString().split('T')[0]}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Available Time Slots <span className="text-red-500">*</span>
//             </label>
//             {loadingSlots ? (
//               <div className="flex items-center justify-center py-3 bg-slate-50 rounded-xl">
//                 <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
//                 <span className="ml-2 text-sm text-slate-500">Loading slots...</span>
//               </div>
//             ) : availableSlots.length === 0 ? (
//               <div className="py-3 bg-amber-50 rounded-xl text-center">
//                 <p className="text-sm text-amber-700">No available slots for this date</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl">
//                 {availableSlots.map((slot, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => handleTimeSlotSelect(slot)}
//                     disabled={slot.booked}
//                     className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
//                       slot.booked
//                         ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
//                         : formData.timeSlot === slot.time
//                         ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
//                         : 'bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50'
//                     }`}
//                   >
//                     {slot.time}
//                     {slot.booked && <span className="ml-1 text-[8px]">(Booked)</span>}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Appointment Type */}
//         <div>
//           <label className="block text-xs font-bold text-slate-700 mb-1.5">
//             Appointment Type <span className="text-red-500">*</span>
//           </label>
//           <div className="grid grid-cols-2 gap-3">
//             <button
//               type="button"
//               onClick={() => handleInputChange({ target: { name: 'appointmentType', value: 'physical' } })}
//               className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
//                 formData.appointmentType === 'physical'
//                   ? 'border-blue-600 bg-blue-50 text-blue-600'
//                   : 'border-slate-200 hover:border-slate-300 text-slate-600'
//               }`}
//             >
//               <User className="w-4 h-4" />
//               <span className="text-sm font-medium">Physical Visit</span>
//             </button>
//             <button
//               type="button"
//               onClick={() => handleInputChange({ target: { name: 'appointmentType', value: 'virtual' } })}
//               className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
//                 formData.appointmentType === 'virtual'
//                   ? 'border-blue-600 bg-blue-50 text-blue-600'
//                   : 'border-slate-200 hover:border-slate-300 text-slate-600'
//               }`}
//             >
//               <Video className="w-4 h-4" />
//               <span className="text-sm font-medium">Video Consultation</span>
//             </button>
//           </div>
//         </div>

//         {/* Reason & Symptoms */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Reason for Visit <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               name="reason"
//               value={formData.reason}
//               onChange={handleInputChange}
//               rows="3"
//               required
//               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
//               placeholder="Brief reason for visit"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1.5">
//               Symptoms
//             </label>
//             <textarea
//               name="symptoms"
//               value={formData.symptoms}
//               onChange={handleInputChange}
//               rows="3"
//               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
//               placeholder="List your symptoms"
//             />
//           </div>
//         </div>

//         {/* Notes */}
//         <div>
//           <label className="block text-xs font-bold text-slate-700 mb-1.5">
//             Additional Notes
//           </label>
//           <textarea
//             name="notes"
//             value={formData.notes}
//             onChange={handleInputChange}
//             rows="2"
//             className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
//             placeholder="Any additional information"
//           />
//         </div>

//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={submitting}
//           className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
//         >
//           {submitting ? (
//             <>
//               <Loader2 className="w-5 h-5 animate-spin" />
//               Booking Appointment...
//             </>
//           ) : (
//             <>
//               <Check className="w-5 h-5" />
//               Book Appointment
//             </>
//           )}
//         </button>
//       </form>
//     </motion.div>
//   );
// };

// const AppointmentSummary = ({ selectedDoctor, formData }) => {
//   if (!selectedDoctor) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.3 }}
//         className="sticky top-24 bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
//       >
//         <div className="text-center py-8">
//           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Calendar className="w-8 h-8 text-slate-400" />
//           </div>
//           <h3 className="font-bold text-slate-700">No Doctor Selected</h3>
//           <p className="text-sm text-slate-500 mt-1">Select a doctor to see appointment summary</p>
//         </div>
//       </motion.div>
//     );
//   }

//   const consultationFee = selectedDoctor.consultationFee || 500;
//   const tax = Math.round(consultationFee * 0.18);
//   const total = consultationFee + tax;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.3 }}
//       className="sticky top-24"
//     >
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//         <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-transparent">
//           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
//             <Sparkles className="w-5 h-5 text-blue-600" />
//             Appointment Summary
//           </h2>
//         </div>

//         <div className="p-6 space-y-4">
//           {/* Doctor Info */}
//           <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
//               {selectedDoctor.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'D'}
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="font-bold text-slate-900 text-sm truncate">
//                 {selectedDoctor.fullName}
//               </h3>
//               <p className="text-xs text-blue-600 truncate">
//                 {selectedDoctor.specialization || 'General Physician'}
//               </p>
//               <div className="flex items-center gap-1 mt-0.5">
//                 <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
//                 <span className="text-xs font-medium text-slate-600">{selectedDoctor.rating || '4.5'}</span>
//                 <span className="text-xs text-slate-400">•</span>
//                 <span className="text-xs text-slate-500">{selectedDoctor.experience || 0} yrs exp</span>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2.5 text-sm">
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Doctor</span>
//               <span className="font-medium text-slate-900">{selectedDoctor.fullName}</span>
//             </div>
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Department</span>
//               <span className="font-medium text-slate-900">
//                 {selectedDoctor.department || selectedDoctor.specialization || 'General'}
//               </span>
//             </div>
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Hospital</span>
//               <span className="font-medium text-slate-900">
//                 {selectedDoctor.hospital || 'MediCare Hospital'}
//               </span>
//             </div>
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Date</span>
//               <span className="font-medium text-slate-900">
//                 {formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
//                   day: '2-digit',
//                   month: 'short',
//                   year: 'numeric',
//                 }) : 'Not selected'}
//               </span>
//             </div>
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Time</span>
//               <span className="font-medium text-slate-900">
//                 {formData.timeSlot || 'Not selected'}
//               </span>
//             </div>
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Type</span>
//               <span className="font-medium text-emerald-600">
//                 {formData.appointmentType === 'virtual' ? 'Video Consultation' : 'Physical Visit'}
//               </span>
//             </div>
//             <div className="flex items-center justify-between py-2 border-b border-slate-100">
//               <span className="text-slate-500">Fee</span>
//               <span className="font-medium text-slate-900">₹{selectedDoctor.consultationFee || 500}</span>
//             </div>
//             <div className="flex items-center justify-between py-2">
//               <span className="text-slate-500">Duration</span>
//               <span className="font-medium text-slate-900">30 mins</span>
//             </div>
//           </div>

//           {/* Payment Section */}
//           <div className="mt-4 pt-4 border-t border-slate-200">
//             <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Payment Summary</h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Consultation Fee</span>
//                 <span className="font-medium text-slate-900">₹{consultationFee}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Tax (18%)</span>
//                 <span className="font-medium text-slate-900">₹{tax}</span>
//               </div>
//               <div className="flex items-center justify-between pt-2 border-t border-slate-200">
//                 <span className="font-bold text-slate-900">Total</span>
//                 <span className="font-bold text-blue-600 text-lg">₹{total}</span>
//               </div>
//             </div>

//             {/* Coupon Code */}
//             <div className="mt-3 flex gap-2">
//               <input
//                 type="text"
//                 placeholder="Apply Coupon Code"
//                 className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
//                 Apply
//               </button>
//             </div>
//           </div>

//           <div className="mt-4 pt-4 border-t border-slate-200">
//             <div className="flex items-center gap-2 text-xs text-slate-500">
//               <Shield className="w-3.5 h-3.5 text-emerald-500" />
//               <span>Your appointment is secure and encrypted</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const SuccessModal = ({ isOpen, onClose, bookingData }) => {
//   if (!isOpen || !bookingData) return null;

//   const appointmentId = bookingData._id || bookingData.appointmentId || 'N/A';

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//           className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
//           >
//             <X className="w-5 h-5 text-slate-400" />
//           </button>

//           <div className="text-center">
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
//               className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
//             >
//               <CheckCircle className="w-10 h-10 text-emerald-600" />
//             </motion.div>

//             <h2 className="text-2xl font-extrabold text-slate-900">Appointment Booked Successfully! 🎉</h2>
//             <p className="text-sm text-slate-500 mt-2">
//               Your appointment has been confirmed. You will receive a confirmation email shortly.
//             </p>

//             <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left space-y-2 text-sm">
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Appointment ID</span>
//                 <span className="font-mono text-xs font-bold text-blue-600">
//                   #{appointmentId.slice(-8).toUpperCase()}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Doctor</span>
//                 <span className="font-medium text-slate-900">
//                   {bookingData.doctor?.fullName || 'N/A'}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Department</span>
//                 <span className="font-medium text-slate-900">
//                   {bookingData.doctor?.department || bookingData.doctor?.specialization || 'General'}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Date</span>
//                 <span className="font-medium text-slate-900">
//                   {bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric',
//                   }) : 'N/A'}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-500">Time</span>
//                 <span className="font-medium text-slate-900">{bookingData.timeSlot || 'N/A'}</span>
//               </div>
//             </div>

//             <div className="mt-6 space-y-2.5">
//               <Link
//                 to="/patient/appointments"
//                 className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
//               >
//                 <Calendar className="w-4 h-4" />
//                 Go to My Appointments
//               </Link>
//               <button
//                 onClick={() => toast.success('Downloading confirmation...')}
//                 className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
//               >
//                 <Download className="w-4 h-4" />
//                 Download Confirmation
//               </button>
//               <Link
//                 to="/patient/dashboard"
//                 className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
//               >
//                 <Home className="w-4 h-4" />
//                 Back to Dashboard
//               </Link>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// const BookingSkeleton = () => (
//   <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 py-6 px-4 sm:px-6 lg:px-8">
//     <div className="w-full max-w-[1920px] mx-auto space-y-6 animate-pulse">
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 h-44"></div>
//       <div className="bg-white rounded-2xl p-4 h-16 shadow-sm"></div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="bg-white rounded-2xl p-5 h-48 shadow-sm"></div>
//           ))}
//         </div>
//         <div className="bg-white rounded-3xl p-6 h-96 shadow-sm"></div>
//       </div>
//     </div>
//   </div>
// );

// export default BookAppointment;









// src/pages/BookAppointment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Building,
  Award,
  Star,
  Phone,
  Video,
  CheckCircle,
  X,
  Search,
  Filter,
  ChevronDown,
  Heart,
  FileText,
  MessageSquare,
  CalendarDays,
  Sparkles,
  Loader2,
  Check,
  Download,
  Languages,
  Users,
  Briefcase,
  DollarSign,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  UserCircle,
  Hospital,
  Shield,
  AlertCircle,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [departments, setDepartments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'All',
    experience: 'All',
    availableToday: false,
    minRating: 0,
    sortBy: 'rating',
  });

  // Booking Form State
  const [formData, setFormData] = useState({
    patientName: user?.fullName || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    doctor: '',
    department: '',
    date: '',
    timeSlot: '',
    appointmentType: 'physical',
    reason: '',
    symptoms: '',
    notes: '',
  });

  // Fetch doctors from backend
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/doctors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Doctor API Response:', response.data);

      // Handle different response structures
      let doctorsData = [];
      if (response.data.doctors) doctorsData = response.data.doctors;
      else if (Array.isArray(response.data)) doctorsData = response.data;
      else if (response.data.data) doctorsData = response.data.data;

      // Filter only active/approved doctors
      const activeDoctors = doctorsData.filter(
        (doc) => doc.status === 'active' || doc.status === 'approved' || !doc.status
      );

      console.log('Active Doctors:', activeDoctors);

      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);

      // Extract unique departments
      const depts = [...new Set(activeDoctors.map((doc) => doc.department || doc.specialization).filter(Boolean))];
      setDepartments(depts);

      // If doctorId is provided, select that doctor
      if (doctorId) {
        const doctor = activeDoctors.find((doc) => doc._id === doctorId);
        if (doctor) {
          setSelectedDoctor(doctor);
          setFormData((prev) => ({
            ...prev,
            doctor: doctor._id,
            department: doctor.department || doctor.specialization || '',
          }));
          setShowBookingForm(true);
        }
      }

    } catch (error) {
      console.error('Error fetching doctors:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      toast.error('Failed to load doctors. Please try again.');
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !formData.date) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/doctors/available-slots/${selectedDoctor._id}`,
          {
            params: { date: formData.date },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAvailableSlots(response.data.slots || []);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
        toast.error('Failed to load available slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, formData.date]);

  // Filter and sort doctors
  useEffect(() => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.fullName?.toLowerCase().includes(term) ||
          doc.specialization?.toLowerCase().includes(term) ||
          doc.department?.toLowerCase().includes(term) ||
          doc.hospital?.toLowerCase().includes(term) ||
          doc.location?.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(
        (doc) =>
          doc.department === selectedDepartment ||
          doc.specialization === selectedDepartment
      );
    }

    // Gender filter
    if (filters.gender !== 'All') {
      filtered = filtered.filter((doc) => doc.gender === filters.gender);
    }

    // Experience filter
    if (filters.experience !== 'All') {
      const exp = parseInt(filters.experience);
      filtered = filtered.filter((doc) => (doc.experience || 0) >= exp);
    }

    // Available today filter
    if (filters.availableToday) {
      filtered = filtered.filter((doc) => doc.isAvailable !== false);
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter((doc) => (doc.rating || 0) >= filters.minRating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'fee':
        filtered.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
        break;
      case 'experience':
        filtered.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
      default:
        break;
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedDepartment, doctors, filters]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData((prev) => ({
      ...prev,
      doctor: doctor._id,
      department: doctor.department || doctor.specialization || '',
    }));
    setShowBookingForm(true);
    // Scroll to booking form
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset time slot when date changes
    if (name === 'date') {
      setFormData((prev) => ({ ...prev, timeSlot: '' }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('All');
    setFilters({
      gender: 'All',
      experience: 'All',
      availableToday: false,
      minRating: 0,
      sortBy: 'rating',
    });
  };

  const handleTimeSlotSelect = (slot) => {
    if (slot.booked) return;
    setFormData((prev) => ({ ...prev, timeSlot: slot.time }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.doctor) {
      toast.error('Please select a doctor');
      return;
    }
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }
    if (!formData.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    if (!formData.reason) {
      toast.error('Please provide a reason for visit');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        doctorId: formData.doctor,
        date: formData.date,
        timeSlot: formData.timeSlot,
        appointmentType: formData.appointmentType,
        reason: formData.reason,
        symptoms: formData.symptoms,
        notes: formData.notes,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/patients/appointments`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookingData(response.data.appointment);
      setShowSuccessModal(true);
      toast.success('Appointment booked successfully!');

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'D';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <BookingSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30 pb-12">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
          {/* Left Column */}
          <div className="xl:col-span-8 2xl:col-span-8 space-y-6">
            {/* Search & Filters */}
            <SearchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              departments={departments}
              filters={filters}
              handleFilterChange={handleFilterChange}
              resetFilters={resetFilters}
            />

            {/* Doctors Grid or Booking Form */}
            {!showBookingForm ? (
              <DoctorsGrid
                doctors={filteredDoctors}
                onSelectDoctor={handleDoctorSelect}
                selectedDoctorId={selectedDoctor?._id}
              />
            ) : (
              <BookingForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleBookingSubmit}
                submitting={submitting}
                selectedDoctor={selectedDoctor}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
                onBack={() => {
                  setShowBookingForm(false);
                  setSelectedDoctor(null);
                  setAvailableSlots([]);
                }}
                handleTimeSlotSelect={handleTimeSlotSelect}
              />
            )}
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="xl:col-span-4 2xl:col-span-4">
            <AppointmentSummary
              selectedDoctor={selectedDoctor}
              formData={formData}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingData={bookingData}
      />
    </div>
  );
};

// ==================== COMPONENTS ====================

const HeroSection = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative"
  >
    <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl shadow-teal-600/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-teal-300" />
            Book Appointment
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm lg:text-base">
            Choose your preferred doctor, date and time for a seamless healthcare experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-white text-xs font-bold">Today's Date</p>
              <p className="text-teal-200 text-[11px]">
                {new Date().toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-300" />
            <div>
              <p className="text-white text-xs font-bold">Department</p>
              <p className="text-teal-200 text-[11px]">Select a department</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-300" />
            <div>
              <p className="text-white text-xs font-bold">Doctor</p>
              <p className="text-teal-200 text-[11px]">Choose a doctor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  departments,
  filters,
  handleFilterChange,
  resetFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, department, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-w-[140px]"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 text-sm font-medium ${
                showAdvancedFilters
                  ? 'bg-teal-50 border-teal-200 text-teal-600'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.gender !== 'All' || filters.experience !== 'All' || filters.availableToday || filters.minRating > 0) && (
                <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              )}
            </button>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-w-[140px]"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="fee">Sort: Lowest Fee</option>
              <option value="experience">Sort: Most Experienced</option>
            </select>
            {(searchTerm || selectedDepartment !== 'All' || filters.gender !== 'All' || filters.experience !== 'All' || filters.availableToday || filters.minRating > 0) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium text-red-600 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="All">Any</option>
                    <option value="5">5+ years</option>
                    <option value="10">10+ years</option>
                    <option value="15">15+ years</option>
                    <option value="20">20+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="0">Any</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.availableToday}
                      onChange={(e) => handleFilterChange('availableToday', e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Available Today</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const DoctorsGrid = ({ doctors, onSelectDoctor, selectedDoctorId }) => {
  const getInitials = (name) => {
    if (!name) return 'D';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (doctors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center"
      >
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">No Doctors Available</h3>
        <p className="text-sm text-slate-500 mt-2">
          {doctors.length === 0 && doctors.length === 0
            ? 'No doctors are currently available. Please check back later.'
            : 'Try adjusting your search filters'}
        </p>
        {doctors.length === 0 && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-600/20"
          >
            Refresh
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {doctors.map((doctor, index) => {
        const isSelected = selectedDoctorId === doctor._id;
        return (
          <motion.div
            key={doctor._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 overflow-hidden group ${
              isSelected ? 'border-teal-500 shadow-lg shadow-teal-500/20' : 'border-slate-100'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                  {doctor.profilePhoto ? (
                    <img
                      src={doctor.profilePhoto}
                      alt={doctor.fullName}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-teal-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold ring-4 ring-teal-100">
                      {getInitials(doctor.fullName)}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center ring-2 ring-white">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate">
                    {doctor.fullName}
                  </h3>
                  <p className="text-sm text-teal-600 font-medium truncate">
                    {doctor.specialization || doctor.department || 'General Physician'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {doctor.experience || 0} yrs
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {doctor.rating || '4.5'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {doctor.hospital || 'City Hospital'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doctor.isAvailable !== false
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {doctor.isAvailable !== false ? 'Available Today' : 'Unavailable'}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    ₹{doctor.consultationFee || 500}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {doctor.patientsTreated || 0} patients
                </span>
              </div>

              {doctor.languages && doctor.languages.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                  <Languages className="w-3 h-3" />
                  <span>{doctor.languages.join(', ')}</span>
                </div>
              )}

              {doctor.about && (
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{doctor.about}</p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectDoctor(doctor)}
                  className={`flex-1 px-4 py-2.5 rounded-xl transition-colors text-xs font-bold text-center flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      Select Doctor
                    </>
                  )}
                </button>
                <Link
                  to={`/patient/doctor-profile/${doctor._id}`}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-bold"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const BookingForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  submitting,
  selectedDoctor,
  availableSlots,
  loadingSlots,
  onBack,
  handleTimeSlotSelect,
}) => {
  return (
    <motion.div
      id="booking-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/30 to-transparent">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">Appointment Details</h2>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Patient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                placeholder="Enter patient name"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Doctor & Department (Read Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Selected Doctor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={selectedDoctor ? selectedDoctor.fullName: 'Not selected'}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Department
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.department}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Available Time Slots <span className="text-red-500">*</span>
            </label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-3 bg-slate-50 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                <span className="ml-2 text-sm text-slate-500">Loading slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-3 bg-amber-50 rounded-xl text-center">
                <p className="text-sm text-amber-700">No available slots for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={slot.booked}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      slot.booked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : formData.timeSlot === slot.time
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    {slot.time}
                    {slot.booked && <span className="ml-1 text-[8px]">(Booked)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Appointment Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange({ target: { name: 'appointmentType', value: 'physical' } })}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                formData.appointmentType === 'physical'
                  ? 'border-teal-600 bg-teal-50 text-teal-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Physical Visit</span>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange({ target: { name: 'appointmentType', value: 'virtual' } })}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                formData.appointmentType === 'virtual'
                  ? 'border-teal-600 bg-teal-50 text-teal-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="text-sm font-medium">Video Consultation</span>
            </button>
          </div>
        </div>

        {/* Reason & Symptoms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows="3"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
              placeholder="Brief reason for visit"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
              placeholder="List your symptoms"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
            placeholder="Any additional information"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Booking Appointment...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Book Appointment
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

const AppointmentSummary = ({ selectedDoctor, formData }) => {
  if (!selectedDoctor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="sticky top-24 bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700">No Doctor Selected</h3>
          <p className="text-sm text-slate-500 mt-1">Select a doctor to see appointment summary</p>
        </div>
      </motion.div>
    );
  }

  const consultationFee = selectedDoctor.consultationFee || 500;
  const tax = Math.round(consultationFee * 0.18);
  const total = consultationFee + tax;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="sticky top-24"
    >
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-transparent">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Appointment Summary
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {selectedDoctor.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {selectedDoctor.fullName}
              </h3>
              <p className="text-xs text-teal-600 truncate">
                {selectedDoctor.specialization || 'General Physician'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium text-slate-600">{selectedDoctor.rating || '4.5'}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{selectedDoctor.experience || 0} yrs exp</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Doctor</span>
              <span className="font-medium text-slate-900">{selectedDoctor.fullName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-slate-900">
                {selectedDoctor.department || selectedDoctor.specialization || 'General'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Hospital</span>
              <span className="font-medium text-slate-900">
                {selectedDoctor.hospital || 'MediCare Hospital'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-900">
                {formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }) : 'Not selected'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Time</span>
              <span className="font-medium text-slate-900">
                {formData.timeSlot || 'Not selected'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Type</span>
              <span className="font-medium text-emerald-600">
                {formData.appointmentType === 'virtual' ? 'Video Consultation' : 'Physical Visit'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Fee</span>
              <span className="font-medium text-slate-900">₹{selectedDoctor.consultationFee || 500}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Duration</span>
              <span className="font-medium text-slate-900">30 mins</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-medium text-slate-900">₹{consultationFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tax (18%)</span>
                <span className="font-medium text-slate-900">₹{tax}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-teal-600 text-lg">₹{total}</span>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Apply Coupon Code"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                Apply
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your appointment is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SuccessModal = ({ isOpen, onClose, bookingData }) => {
  if (!isOpen || !bookingData) return null;

  const appointmentId = bookingData._id || bookingData.appointmentId || 'N/A';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <h2 className="text-2xl font-extrabold text-slate-900">Appointment Booked Successfully! 🎉</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your appointment has been confirmed. You will receive a confirmation email shortly.
            </p>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Appointment ID</span>
                <span className="font-mono text-xs font-bold text-teal-600">
                  #{appointmentId.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium text-slate-900">
                  {bookingData.doctor?.fullName || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-900">
                  {bookingData.doctor?.department || bookingData.doctor?.specialization || 'General'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">
                  {bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-900">{bookingData.timeSlot || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <Link
                to="/patient/appointments"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Go to My Appointments
              </Link>
              <button
                onClick={() => toast.success('Downloading confirmation...')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Confirmation
              </button>
              <Link
                to="/patient/dashboard"
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BookingSkeleton = () => (
  <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30 py-6 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-[1920px] mx-auto space-y-6 animate-pulse">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-8 h-44"></div>
      <div className="bg-white rounded-2xl p-4 h-16 shadow-sm"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-48 shadow-sm"></div>
          ))}
        </div>
        <div className="bg-white rounded-3xl p-6 h-96 shadow-sm"></div>
      </div>
    </div>
  </div>
);

export default BookAppointment;