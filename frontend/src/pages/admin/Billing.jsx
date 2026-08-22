// src/pages/admin/Billing.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  Search,
  Eye,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  PlusCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  User,
  Stethoscope,
  Pill,
  Microscope,
  Bed,
  Calendar,
  CreditCard,
  Wallet,
  Send,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 5;

  const searchInputRef = useRef(null);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBills: 0,
    pendingPayments: 0,
    unpaidBills: 0,
  });

  // ── Create Bill Form State ──
  const [newBill, setNewBill] = useState({
    patientName: "",
    patientId: "",
    patientEmail: "",
    patientPhone: "",
    doctorName: "",
    department: "",
    consultationFee: 500,
    labCharges: 0,
    medicineCharges: 0,
    roomCharges: 0,
    otherCharges: 0,
    discount: 0,
    tax: 0,
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    billingDate: new Date().toISOString().split('T')[0],
  });

  // ── Fetch Data ──
  useEffect(() => {
    fetchBillingData();
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getInvoices();
      console.log("Billing Response:", response.data);

      if (response.data.success) {
        const data = response.data.data || [];
        setInvoices(data);
        calculateStats(data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing data");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalRevenue = data.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const totalBills = data.length;
    const pendingPayments = data
      .filter(inv => inv.paymentStatus === "Pending" || inv.status === "pending")
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
    const unpaidBills = data
      .filter(inv => inv.paymentStatus === "Pending" || inv.paymentStatus === "Partially Paid" || inv.status === "pending" || inv.status === "partially_paid")
      .length;

    setStats({ totalRevenue, totalBills, pendingPayments, unpaidBills });
  };

  // ── Calculate Total ──
  const calculateTotal = () => {
    const subtotal = (newBill.consultationFee || 0) + 
                     (newBill.labCharges || 0) + 
                     (newBill.medicineCharges || 0) + 
                     (newBill.roomCharges || 0) + 
                     (newBill.otherCharges || 0);
    const discount = newBill.discount || 0;
    const tax = newBill.tax || 0;
    return subtotal - discount + tax;
  };

  // ── Handle Create Bill ──
  const handleCreateBill = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotal();
      const billData = {
        patientName: newBill.patientName,
        patientId: newBill.patientId,
        patientEmail: newBill.patientEmail,
        patientPhone: newBill.patientPhone,
        doctorName: newBill.doctorName,
        department: newBill.department,
        consultationFee: Number(newBill.consultationFee) || 0,
        labCharges: Number(newBill.labCharges) || 0,
        medicineCharges: Number(newBill.medicineCharges) || 0,
        roomCharges: Number(newBill.roomCharges) || 0,
        otherCharges: Number(newBill.otherCharges) || 0,
        discount: Number(newBill.discount) || 0,
        tax: Number(newBill.tax) || 0,
        totalAmount: totalAmount,
        amountPaid: newBill.paymentStatus === "Paid" ? totalAmount : 0,
        paymentMethod: newBill.paymentMethod,
        paymentStatus: newBill.paymentStatus,
        billingDate: newBill.billingDate,
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      };

      const response = await adminAPI.createInvoice(billData);
      
      if (response.data.success) {
        toast.success("Bill created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchBillingData();
      } else {
        toast.error(response.data.message || "Failed to create bill");
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      toast.error(error.response?.data?.message || "Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewBill({
      patientName: "",
      patientId: "",
      patientEmail: "",
      patientPhone: "",
      doctorName: "",
      department: "",
      consultationFee: 500,
      labCharges: 0,
      medicineCharges: 0,
      roomCharges: 0,
      otherCharges: 0,
      discount: 0,
      tax: 0,
      paymentMethod: "Cash",
      paymentStatus: "Pending",
      billingDate: new Date().toISOString().split('T')[0],
    });
  };

  // ── Filters ──
  const filteredInvoices = invoices.filter((inv) => {
    const patientName = inv.patientName || inv.patient?.fullName || inv.patient?.name || "";
    const doctorName = inv.doctorName || inv.doctor?.user?.fullName || inv.doctor?.fullName || "";
    const matchSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceId || inv.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "" || (inv.paymentStatus || inv.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // ── Helpers ──
  const getStatusBadge = (status) => {
    const map = {
      Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      "Partially Paid": "bg-cyan-50 text-cyan-700 border-cyan-200",
      partially_paid: "bg-cyan-50 text-cyan-700 border-cyan-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const map = {
      Paid: <CheckCircle size={14} className="text-emerald-500" />,
      paid: <CheckCircle size={14} className="text-emerald-500" />,
      completed: <CheckCircle size={14} className="text-emerald-500" />,
      Pending: <Clock size={14} className="text-amber-500" />,
      pending: <Clock size={14} className="text-amber-500" />,
      "Partially Paid": <AlertCircle size={14} className="text-cyan-500" />,
      partially_paid: <AlertCircle size={14} className="text-cyan-500" />,
      Cancelled: <XCircle size={14} className="text-red-500" />,
      cancelled: <XCircle size={14} className="text-red-500" />,
    };
    return map[status] || null;
  };

  const getDisplayStatus = (status) => {
    const map = {
      paid: "Paid",
      pending: "Pending",
      partially_paid: "Partially Paid",
      cancelled: "Cancelled",
      completed: "Paid",
    };
    return map[status] || status || "Unknown";
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDrawer(true);
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const response = await adminAPI.updateInvoiceStatus(id, { status: "paid" });
      if (response.data.success) {
        toast.success("Invoice marked as paid!");
        fetchBillingData();
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  // ── Stat Card ──
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      <div className="flex items-start justify-between">
        <div className={`${color.bg} p-2.5 rounded-xl`}>
          <Icon size={20} className={color.text} />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900 mt-3">
        {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
      </p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </motion.div>
  );

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-100">
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                <div className="h-6 w-20 bg-gray-200 rounded mt-3"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-xl shadow-teal-600/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-teal-300" />
                Billing Management
              </h1>
              <p className="text-teal-100 text-sm mt-1">Manage patient invoices and payments</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-white text-xs font-bold">Total Revenue</p>
                  <p className="text-emerald-200 text-sm font-semibold">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-300" />
                <div>
                  <p className="text-white text-xs font-bold">Pending</p>
                  <p className="text-amber-200 text-sm font-semibold">₹{stats.pendingPayments.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={stats.totalRevenue}
            color={{ bg: "bg-emerald-50", text: "text-emerald-600" }}
          />
          <StatCard
            icon={FileText}
            label="Total Bills"
            value={stats.totalBills}
            color={{ bg: "bg-teal-50", text: "text-teal-600" }}
          />
          <StatCard
            icon={Clock}
            label="Pending Payments"
            value={stats.pendingPayments}
            color={{ bg: "bg-amber-50", text: "text-amber-600" }}
          />
          <StatCard
            icon={AlertCircle}
            label="Unpaid Bills"
            value={stats.unpaidBills}
            color={{ bg: "bg-red-50", text: "text-red-600" }}
          />
        </motion.div>

        {/* ── Search & Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm mb-6 border border-white/50"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by patient, doctor or bill ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <X size={16} /> Clear
            </button>
            <button
              onClick={fetchBillingData}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-teal-600/20"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <PlusCircle size={16} /> Create Bill
            </button>
          </div>
          <div className="text-sm text-slate-500 mt-3">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </div>
        </motion.div>

        {/* ── Billing Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-white/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Bill ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Patient ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice, index) => {
                    const patientName = invoice.patientName || invoice.patient?.fullName || invoice.patient?.name || "Unknown";
                    const doctorName = invoice.doctorName || invoice.doctor?.user?.fullName || invoice.doctor?.fullName || "Unknown";
                    const displayStatus = getDisplayStatus(invoice.paymentStatus || invoice.status);
                    const billDate = invoice.billingDate || invoice.createdAt;

                    return (
                      <motion.tr
                        key={invoice._id || invoice.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-teal-50/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-teal-600">{invoice.invoiceId || invoice.id || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                              {patientName.charAt(0) || "P"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{patientName}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[120px]">{invoice.patientEmail || invoice.patient?.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-slate-600">{invoice.patientId || invoice.patient?.id || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-sm text-slate-600 truncate max-w-[120px]">{doctorName}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-sm text-slate-600">{billDate ? new Date(billDate).toLocaleDateString() : "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">₹{(invoice.totalAmount || invoice.amount || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(invoice.paymentStatus || invoice.status)}`}>
                            {getStatusIcon(invoice.paymentStatus || invoice.status)}
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg transition-colors"
                              title="View Invoice"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                              title="Edit Bill"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors hidden sm:inline-flex"
                              title="Print"
                            >
                              <Printer size={14} />
                            </button>
                            {(invoice.paymentStatus !== "Paid" && invoice.paymentStatus !== "paid" && invoice.paymentStatus !== "completed") && (
                              <button
                                onClick={() => handleMarkAsPaid(invoice._id || invoice.id)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                title="Mark as Paid"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      <FileText size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No billing records found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {filteredInvoices.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Create Bill Modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCreateModal(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Create New Bill</h2>
                      <p className="text-sm text-slate-500">Generate invoice for patient services</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateBill} className="space-y-6">
                    {/* Patient Details */}
                    <div className="bg-slate-50 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <User size={16} className="text-teal-600" />
                        Patient Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient Name *</label>
                          <input
                            type="text"
                            required
                            value={newBill.patientName}
                            onChange={(e) => setNewBill({ ...newBill, patientName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder="Enter patient name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient ID</label>
                          <input
                            type="text"
                            value={newBill.patientId}
                            onChange={(e) => setNewBill({ ...newBill, patientId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder="Enter patient ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={newBill.patientEmail}
                            onChange={(e) => setNewBill({ ...newBill, patientEmail: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder="patient@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                          <input
                            type="tel"
                            value={newBill.patientPhone}
                            onChange={(e) => setNewBill({ ...newBill, patientPhone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Doctor & Department */}
                    <div className="bg-slate-50 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Stethoscope size={16} className="text-teal-600" />
                        Doctor & Department
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor Name</label>
                          <input
                            type="text"
                            value={newBill.doctorName}
                            onChange={(e) => setNewBill({ ...newBill, doctorName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder="Enter doctor name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                          <input
                            type="text"
                            value={newBill.department}
                            onChange={(e) => setNewBill({ ...newBill, department: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder="Enter department"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Charges */}
                    <div className="bg-slate-50 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-teal-600" />
                        Charges & Services
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Consultation Fee (₹)</label>
                          <input
                            type="number"
                            value={newBill.consultationFee}
                            onChange={(e) => setNewBill({ ...newBill, consultationFee: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Lab/Diagnostic Charges (₹)</label>
                          <input
                            type="number"
                            value={newBill.labCharges}
                            onChange={(e) => setNewBill({ ...newBill, labCharges: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Medicine Charges (₹)</label>
                          <input
                            type="number"
                            value={newBill.medicineCharges}
                            onChange={(e) => setNewBill({ ...newBill, medicineCharges: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Room/Bed Charges (₹)</label>
                          <input
                            type="number"
                            value={newBill.roomCharges}
                            onChange={(e) => setNewBill({ ...newBill, roomCharges: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Other Charges (₹)</label>
                          <input
                            type="number"
                            value={newBill.otherCharges}
                            onChange={(e) => setNewBill({ ...newBill, otherCharges: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discount, Tax & Payment */}
                    <div className="bg-slate-50 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Wallet size={16} className="text-teal-600" />
                        Payment Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount (₹)</label>
                          <input
                            type="number"
                            value={newBill.discount}
                            onChange={(e) => setNewBill({ ...newBill, discount: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax (GST) (₹)</label>
                          <input
                            type="number"
                            value={newBill.tax}
                            onChange={(e) => setNewBill({ ...newBill, tax: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                          <select
                            value={newBill.paymentMethod}
                            onChange={(e) => setNewBill({ ...newBill, paymentMethod: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Net Banking">Net Banking</option>
                            <option value="Insurance">Insurance</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Status</label>
                          <select
                            value={newBill.paymentStatus}
                            onChange={(e) => setNewBill({ ...newBill, paymentStatus: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing Date</label>
                          <input
                            type="date"
                            value={newBill.billingDate}
                            onChange={(e) => setNewBill({ ...newBill, billingDate: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-600">Total Amount</p>
                          <p className="text-xs text-slate-400">Including all charges, discount & tax</p>
                        </div>
                        <p className="text-3xl font-bold text-teal-600">₹{calculateTotal().toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Generate Bill
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Invoice Details Drawer ── */}
      {showDrawer && selectedInvoice && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setShowDrawer(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
                  <p className="text-sm text-slate-500">{selectedInvoice.invoiceId || selectedInvoice.id || "N/A"}</p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Hospital Header */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-4 text-white mb-6">
                <p className="font-bold text-lg">MediCare Hospital</p>
                <p className="text-xs text-teal-200">Premium Healthcare Services</p>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Patient Name</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedInvoice.patientName || selectedInvoice.patient?.fullName || selectedInvoice.patient?.name || "Unknown"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Patient ID</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedInvoice.patientId || selectedInvoice.patient?.id || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Doctor</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedInvoice.doctorName || selectedInvoice.doctor?.user?.fullName || selectedInvoice.doctor?.fullName || "Unknown"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedInvoice.billingDate ? new Date(selectedInvoice.billingDate).toLocaleDateString() :
                     selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="border-t border-slate-100 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900">₹{(selectedInvoice.totalAmount || selectedInvoice.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span className="text-slate-900">₹{selectedInvoice.tax || 0}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                    <span className="text-slate-900">Grand Total</span>
                    <span className="text-teal-600">₹{(selectedInvoice.totalAmount || selectedInvoice.amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedInvoice.paymentMethod || "N/A"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedInvoice.paymentStatus || selectedInvoice.status)}`}>
                    {getStatusIcon(selectedInvoice.paymentStatus || selectedInvoice.status)}
                    {getDisplayStatus(selectedInvoice.paymentStatus || selectedInvoice.status)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 text-sm shadow-lg shadow-teal-600/20 transition-colors">
                  <Download size={16} /> Download PDF
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl font-medium flex items-center justify-center gap-2 text-sm transition-colors">
                    <Printer size={16} /> Print
                  </button>
                  <button className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-medium flex items-center justify-center gap-2 text-sm transition-colors">
                    <CheckCircle size={16} /> Mark Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Billing;