import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../../services/api";

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Retrieve patient support tickets from backend API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/support-messages");

      const ticketsData =
        response.data?.data ||
        response.data?.tickets ||
        (Array.isArray(response.data) ? response.data : []);

      setTickets(ticketsData);
    } catch (error) {
      console.error("Fetch support tickets error:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update support ticket resolution status
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await api.patch(
        `/admin/support-messages/${ticketId}/status`,
        { status: newStatus }
      );

      if (response.data?.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(
        error.response?.data?.error || "Failed to update ticket status"
      );
    }
  };

  // Permanently delete ticket record
  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await api.delete(`/admin/support-messages/${ticketId}`);
      if (response.data?.success) {
        toast.success("Ticket deleted successfully");
        setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      }
    } catch (error) {
      console.error("Delete ticket error:", error);
      toast.error(
        error.response?.data?.error || "Failed to delete support ticket"
      );
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const currentStatus = (ticket.status || "open").toLowerCase();
    const matchesStatus =
      filterStatus === "all" ? true : currentStatus === filterStatus.toLowerCase();

    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => (t.status || "open").toLowerCase() === "open").length;
  const progressCount = tickets.filter((t) => (t.status || "").toLowerCase() === "in-progress").length;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Support Help Desk Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Patient Support Help Desk
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                Monitor patient inquiries, manage issues, and technical support logs.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchTickets}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-all duration-300 font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <span>{loading ? "Refreshing..." : "↻ Reload Messages"}</span>
            </motion.button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Support Metric Counters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="bg-emerald-50/40 rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-200/80">
            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">Open</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 mt-1">{openCount}</p>
          </div>
          <div className="bg-amber-50/40 rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-200/80">
            <p className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">In Progress</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-700 mt-1">{progressCount}</p>
          </div>
        </motion.div>

        {/* Filter and Search Controls Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { label: "All Tickets", value: "all" },
              { label: "Open", value: "open" },
              { label: "In Progress", value: "in-progress" },
              { label: "Resolved", value: "resolved" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  filterStatus === tab.value
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search subject, user or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
            />
          </div>
        </motion.div>

        {/* Support Tickets List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-400">Loading support tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-2 shadow-sm">
            <div className="text-5xl mb-2">📩</div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">No Tickets Found</h3>
            <p className="text-xs sm:text-sm text-slate-500">No patient requests matching the current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket, index) => {
              const statusLower = (ticket.status || "open").toLowerCase();
              const isResolved = statusLower === "resolved";

              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${
                          isResolved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : statusLower === "in-progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}
                      >
                        {ticket.status || "open"}
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(ticket.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      {ticket.subject}
                    </h3>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                        {ticket.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
                      <span className="font-semibold text-slate-800">
                        👤 {ticket.user?.fullName || "Patient User"}
                      </span>
                      <span className="font-medium text-slate-600">
                        ✉ {ticket.email || ticket.user?.email || "No Email"}
                      </span>
                      {ticket.user?.phoneNumber && (
                        <span className="font-medium text-slate-600">
                          📞 {ticket.user.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex md:flex-col gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 min-w-[140px]">
                    {isResolved ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(ticket._id, "in-progress")}
                        className="flex-1 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs sm:text-sm rounded-xl border border-amber-200 transition cursor-pointer"
                      >
                        Mark In Progress
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(ticket._id, "resolved")}
                        className="flex-1 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Mark Resolved
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeleteTicket(ticket._id)}
                      className="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm rounded-xl border border-rose-200 transition cursor-pointer"
                    >
                      Delete Ticket
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;