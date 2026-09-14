import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  Search,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Send,
} from "lucide-react";
import api from "../../services/api";
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
  const itemsPerPage = 8;

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBills: 0,
    pendingPayments: 0,
    unpaidBills: 0,
  });

  const [newBill, setNewBill] = useState({
    patientName: "",
    doctorName: "",
    consultationFee: 500,
    labCharges: 0,
    paymentStatus: "Pending",
    billingDate: new Date().toISOString().split("T")[0],
  });

  // Fetch billing collection datasets on component mount
  useEffect(() => {
    fetchBillingData();
  }, []);

  // Retrieve administrative invoice records from backend API
  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/invoices");
      if (response.data?.success) {
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

  // Compute revenue and outstanding collection metrics
  const calculateStats = (data) => {
    const totalRevenue = data
      .filter((inv) => ["Paid", "paid", "completed"].includes(inv.paymentStatus || inv.status))
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.consultationFee || 0), 0);

    const totalBills = data.length;

    const pendingPayments = data
      .filter((inv) => ["Pending", "pending"].includes(inv.paymentStatus || inv.status))
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.consultationFee || 0), 0);

    const unpaidBills = data.filter((inv) =>
      ["Pending", "pending"].includes(inv.paymentStatus || inv.status)
    ).length;

    setStats({ totalRevenue, totalBills, pendingPayments, unpaidBills });
  };

  const calculateTotal = () => {
    return (Number(newBill.consultationFee) || 0) + (Number(newBill.labCharges) || 0);
  };

  // Submit newly generated invoice payload
  const handleCreateBill = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotal();
      const billData = {
        patientName: newBill.patientName,
        doctorName: newBill.doctorName,
        consultationFee: Number(newBill.consultationFee) || 0,
        labCharges: Number(newBill.labCharges) || 0,
        totalAmount,
        paymentStatus: newBill.paymentStatus,
        billingDate: newBill.billingDate,
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      };

      const response = await api.post("/admin/invoices", billData);
      if (response.data?.success) {
        toast.success("Bill created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchBillingData();
      } else {
        toast.error(response.data?.message || "Failed to create bill");
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      toast.error("Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewBill({
      patientName: "",
      doctorName: "",
      consultationFee: 500,
      labCharges: 0,
      paymentStatus: "Pending",
      billingDate: new Date().toISOString().split("T")[0],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const patientName = inv.patientName || inv.patient?.fullName || "";
    const doctorName = inv.doctorName || inv.doctor?.user?.fullName || "";
    const matchSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "" || (inv.paymentStatus || inv.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const map = {
      Paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      Pending: "bg-amber-50 text-amber-700 border-amber-200/60",
      pending: "bg-amber-50 text-amber-700 border-amber-200/60",
      Cancelled: "bg-rose-50 text-rose-700 border-rose-200/60",
    };
    return map[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusIcon = (status) => {
    const map = {
      Paid: <CheckCircle size={13} className="text-emerald-500" />,
      paid: <CheckCircle size={13} className="text-emerald-500" />,
      completed: <CheckCircle size={13} className="text-emerald-500" />,
      Pending: <Clock size={13} className="text-amber-500" />,
      pending: <Clock size={13} className="text-amber-500" />,
      Cancelled: <XCircle size={13} className="text-rose-500" />,
    };
    return map[status] || null;
  };

  const getDisplayStatus = (status) => {
    const map = {
      paid: "Paid",
      pending: "Pending",
      cancelled: "Cancelled",
      completed: "Paid",
    };
    return map[status] || status || "Unknown";
  };

  // Update payment resolution status
  const handleMarkAsPaid = async (id) => {
    try {
      const response = await api.patch(`/admin/invoices/${id}/status`, { status: "paid" });
      if (response.data?.success) {
        toast.success("Invoice marked as paid!");
        fetchBillingData();
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  if (loading) return <BillingSkeleton />;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">

        {/* Billing & Invoices Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <FileText className="w-7 h-7 text-emerald-200" />
                Billing & Invoices
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                Manage patient transactions and automatic appointment collections.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchBillingData}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-all duration-300 font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <RefreshCw size={14} />
              <span>Refresh Invoices</span>
            </motion.button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Financial Overview Metrics Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {[
            { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, text: "text-emerald-600" },
            { label: "Total Invoices", value: stats.totalBills, icon: FileText, text: "text-teal-600" },
            { label: "Pending Amount", value: `₹${stats.pendingPayments.toLocaleString()}`, icon: Clock, text: "text-amber-600" },
            { label: "Unpaid Invoices", value: stats.unpaidBills, icon: AlertCircle, text: "text-rose-600" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${card.text} mt-1`}>{card.value}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <card.icon size={18} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter and Create Controls Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by patient, doctor, or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-slate-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium text-slate-700 cursor-pointer min-w-[130px]"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle size={16} /> Create Bill
            </motion.button>
          </div>
        </motion.div>

        {/* Billing Invoice Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Bill ID</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Doctor</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((inv, idx) => {
                    const patientName = inv.patientName || "Patient";
                    const doctorName = inv.doctorName || "Doctor";
                    const status = inv.paymentStatus || inv.status;
                    const date = inv.billingDate || inv.createdAt;

                    return (
                      <motion.tr 
                        key={inv._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.04)", transition: { duration: 0.2 } }}
                        className="hover:shadow-sm transition-all duration-200"
                      >
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-bold text-emerald-700">{inv.invoiceId || "N/A"}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                              {patientName.charAt(0)}
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{patientName}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hidden lg:table-cell">
                          <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{doctorName}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hidden sm:table-cell">
                          <p className="text-xs sm:text-sm font-medium text-slate-600">{date ? new Date(date).toLocaleDateString() : "N/A"}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-bold text-slate-900">₹{(inv.totalAmount || inv.consultationFee || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(status)}`}>
                            {getStatusIcon(status)}
                            <span>{getDisplayStatus(status)}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setSelectedInvoice(inv); setShowDrawer(true); }}
                              className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="View Invoice"
                            >
                              <Eye size={14} className="sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handlePrint}
                              className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer hidden sm:inline-flex"
                              title="Print"
                            >
                              <Printer size={14} className="sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                            {!["Paid", "paid", "completed"].includes(status) && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleMarkAsPaid(inv._id)}
                                className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                title="Mark Paid"
                              >
                                <CheckCircle size={14} className="sm:w-3.5 sm:h-3.5" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                      <FileText size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No invoices found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {filteredInvoices.length > 0 && (
            <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs sm:text-sm text-slate-500">
                Showing {paginatedInvoices.length} of {filteredInvoices.length} records
              </p>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </motion.button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 px-2">{currentPage} / {totalPages || 1}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bill Generation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 font-sans"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Create New Bill</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateBill} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Patient Name *</label>
                    <input
                      type="text" required value={newBill.patientName}
                      onChange={(e) => setNewBill({ ...newBill, patientName: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Doctor Name</label>
                    <input
                      type="text" value={newBill.doctorName}
                      onChange={(e) => setNewBill({ ...newBill, doctorName: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Dr. Smith"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Consultation Fee (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newBill.consultationFee}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewBill({ ...newBill, consultationFee: val === "" ? "" : Number(val) });
                      }}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Lab Charges (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newBill.labCharges}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewBill({ ...newBill, labCharges: val === "" ? "" : Number(val) });
                      }}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Total Calculation</span>
                  <span className="text-base font-bold text-emerald-700">₹{calculateTotal().toLocaleString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send size={14} /> Submit Invoice
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Details Drawer */}
      <AnimatePresence>
        {showDrawer && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-4 font-sans"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800">Invoice #{selectedInvoice.invoiceId || "N/A"}</h3>
                <button onClick={() => setShowDrawer(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Patient</span><span className="font-bold text-slate-800">{selectedInvoice.patientName || "Unknown"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Doctor</span><span className="font-bold text-slate-800">{selectedInvoice.doctorName || "Unknown"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-bold text-slate-800">{new Date(selectedInvoice.billingDate || selectedInvoice.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-700">Grand Total</span><span className="font-bold text-emerald-700">₹{(selectedInvoice.totalAmount || selectedInvoice.consultationFee || 0).toLocaleString()}</span></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDrawer(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Dismiss
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const BillingSkeleton = () => (
  <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
    <div className="h-32 bg-slate-200 rounded-3xl" />
    <div className="grid grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
    </div>
    <div className="h-64 bg-slate-200 rounded-2xl" />
  </div>
);

export default Billing;