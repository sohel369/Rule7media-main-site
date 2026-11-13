import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getfranchise,
  sendManualEmail,
  updateFranchiseStatus,
  deleteFranchiseById,
  resetFranchise,
} from "../../store/franchise/franchiseSlice";
import {
  Mail,
  Eye,
  Filter,
  RefreshCw,
  Loader,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send,
  FileEdit,
  CheckCircle2,
} from "lucide-react";
import { FaHandshake } from "react-icons/fa";
import { toast } from "react-toastify";

// ─── Status badge helper ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new: { label: "New", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  contacted: {
    label: "Contacted",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  qualified: {
    label: "Qualified",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  closed: {
    label: "Closed",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

// ─── Default email templates ──────────────────────────────────────────────────
const DEFAULT_TEMPLATES = {
  enquiry: {
    subject: "Thank You for Your Franchise Enquiry – Rule7Media",
    body: `Hi {firstName},

Thank you for reaching out to Rule7 Media regarding our franchise opportunities.

We have received your enquiry from {country} and a member of our franchise team will be in touch with you within 48 hours.

In the meantime, feel free to visit our website for more information.

Warm regards,
Rule7 Media Franchise Team
Franchiseallocations@rule7media.com`,
  },
  franchise_kit: {
    subject: "Your Franchise Kit Request – Rule7Media",
    body: `Hi {firstName},

Thank you for requesting our Franchise Kit for the territory of {territory}.

Our executive team has reviewed your background and will be sending through the full prospectus and onboarding materials within 48 hours.

We look forward to exploring this opportunity with you.

Best regards,
Rule7 Media Franchise Team`,
  },
  franchisefaq: {
    subject: "We've Received Your Franchise Inquiry – Rule7Media",
    body: `Hi {firstName},

Thank you for submitting your inquiry regarding franchise opportunities in {country}, {state}.

We noted your interest in {territories} territories and a franchise advisor will reach out within 48 hours to discuss available options in your area.

Kind regards,
Rule7 Media Franchise Team`,
  },
  risk_mitigation_inquiry: {
    subject: "Your Risk-Managed Future Starts Here – Rule7Media",
    body: `Hi {firstName},

Thank you for reaching out to Rule7 Media's Risk Mitigation team.

We have received your inquiry for the {region} region with an investment timeline of {timeline}.

A dedicated Risk Specialist will contact you within 24 hours to walk you through:
  ✅ Priority territory scouting
  ✅ Shared revenue breakdown
  ✅ Full risk mitigation disclosure

Your partnership is our priority.

Regards,
Rule7 Media Risk Management Team`,
  },
};

// ─── Fill template placeholders ──────────────────────────────────────────────
const fillTemplate = (template, item) => {
  return template
    .replace(/{firstName}/g, item.firstName || "")
    .replace(/{lastName}/g, item.lastName || "")
    .replace(/{country}/g, item.country || "")
    .replace(/{state}/g, item.state || "")
    .replace(/{territories}/g, item.territories || "")
    .replace(/{territory}/g, item.territory || "")
    .replace(/{region}/g, item.region || "")
    .replace(/{timeline}/g, item.timeline || "");
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminFranchise = () => {
  const dispatch = useDispatch();
  const {
    franchise,
    loading,
    error,
    success,
    message,
    pagination,
    emailSending,
    emailSuccess,
    emailError,
  } = useSelector((state) => state.franchise);

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [emailModal, setEmailModal] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES); // editable templates
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [editingTemplateKey, setEditingTemplateKey] = useState("enquiry");

  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    dispatch(
      getfranchise({
        page: currentPage,
        limit: itemsPerPage,
        formType: filterType,
        search: debouncedSearch,
      }),
    );
  }, [dispatch, currentPage, filterType, debouncedSearch]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Redux success/error
  useEffect(() => {
    if (success && message === "Franchise deleted successfully") {
      toast.success(message);
      dispatch(resetFranchise());
      dispatch(
        getfranchise({
          page: currentPage,
          limit: itemsPerPage,
          formType: filterType,
          search: debouncedSearch,
        }),
      );
    }
    if (error) {
      toast.error(error);
      dispatch(resetFranchise());
    }
  }, [success, error, message]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getLocation = (item) => {
    if (item.formType === "enquiry") return item.country || "N/A";
    if (item.formType === "franchise_kit") return item.territory || "N/A";
    if (item.formType === "franchisefaq")
      return [item.country, item.state].filter(Boolean).join(", ") || "N/A";
    if (item.formType === "risk_mitigation_inquiry")
      return item.region || "N/A";
    return "N/A";
  };

  // ─── Status Update ───────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setStatusUpdating(id);
    try {
      await dispatch(updateFranchiseStatus({ id, status: newStatus })).unwrap();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  // ─── Email Composer ──────────────────────────────────────────────────────────
  const openEmailComposer = (item) => {
    const tpl = templates[item.formType] || { subject: "", body: "" };
    setEmailSubject(fillTemplate(tpl.subject, item));
    setEmailBody(fillTemplate(tpl.body, item));
    setEmailModal(item);
  };

  // Handle email send result from Redux
  useEffect(() => {
    if (emailSuccess) {
      toast.success(`✅ Your email has been sent to ${emailModal?.email}`, {
        autoClose: 4000,
      });
      dispatch(resetFranchise());
      if (
        emailModal?._id &&
        (emailModal?.status === "new" || !emailModal?.status)
      ) {
        dispatch(
          updateFranchiseStatus({ id: emailModal._id, status: "contacted" }),
        );
      }
      setEmailModal(null);
    }
    if (emailError) {
      toast.error(emailError || "Failed to send email.");
      dispatch(resetFranchise());
    }
  }, [emailSuccess, emailError]);

  const sendEmail = () => {
    if (!emailModal) return;
    dispatch(
      sendManualEmail({
        to: emailModal.email,
        subject: emailSubject,
        body: emailBody,
      }),
    );
  };

  // ─── Modal ───────────────────────────────────────────────────────────────────
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };
  const handleDelete = (id) => {
    if (window.confirm("Delete this entry?")) dispatch(deleteFranchiseById(id));
  };
  const handlePageChange = (p) => {
    if (p >= 1 && p <= pagination.totalPages) setCurrentPage(p);
  };

  // Counts
  const enquiriesCount = franchise.filter(
    (i) => i.formType === "enquiry",
  ).length;
  const kitCount = franchise.filter(
    (i) => i.formType === "franchise_kit",
  ).length;
  const faqCount = franchise.filter(
    (i) => i.formType === "franchisefaq",
  ).length;
  const riskCount = franchise.filter(
    (i) => i.formType === "risk_mitigation_inquiry",
  ).length;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 rounded-2xl text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Franchise Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Manage enquiries, kit requests, FAQ & Risk Mitigation submissions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTemplateEditorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg hover:bg-rose-500/20 transition text-sm"
            >
              <FileEdit className="w-4 h-4" /> Edit Email Templates
            </button>
            <button
              onClick={() =>
                dispatch(
                  getfranchise({
                    page: currentPage,
                    limit: itemsPerPage,
                    formType: filterType,
                    search: debouncedSearch,
                  }),
                )
              }
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, territory, region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="enquiry">Enquiries</option>
                <option value="franchise_kit">Franchise Kit</option>
                <option value="franchisefaq">FAQ Form</option>
                <option value="risk_mitigation_inquiry">Risk Mitigation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: "Total (Page)",
              value: franchise.length,
              color: "from-blue-900/20 to-blue-800/10 border-blue-500/20",
              text: "text-blue-400",
            },
            {
              label: "Enquiries",
              value: enquiriesCount,
              color: "from-green-900/20 to-green-800/10 border-green-500/20",
              text: "text-green-400",
            },
            {
              label: "Franchise Kit",
              value: kitCount,
              color: "from-purple-900/20 to-purple-800/10 border-purple-500/20",
              text: "text-purple-400",
            },
            {
              label: "FAQ Forms",
              value: faqCount,
              color: "from-orange-900/20 to-orange-800/10 border-orange-500/20",
              text: "text-orange-400",
            },
            {
              label: "Risk Inquiry",
              value: riskCount,
              color: "from-red-900/20 to-red-800/10 border-red-500/20",
              text: "text-red-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.color} border rounded-xl p-4`}
            >
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {[
                    "#",
                    "Name",
                    "Email",
                    "Location",
                    "Type",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {franchise.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  franchise.map((item, idx) => {
                    const statusCfg = STATUS_CONFIG[item.status || "new"];
                    const formTypeLabels = {
                      enquiry: {
                        label: "Enquiry",
                        cls: "bg-green-500/20 text-green-400 border-green-500/30",
                      },
                      franchise_kit: {
                        label: "Franchise Kit",
                        cls: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                      },
                      franchisefaq: {
                        label: "FAQ Form",
                        cls: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                      },
                      risk_mitigation_inquiry: {
                        label: "Risk Inquiry",
                        cls: "bg-red-500/20 text-red-400 border-red-500/30",
                      },
                    };
                    const ftCfg = formTypeLabels[item.formType] || {
                      label: item.formType,
                      cls: "bg-gray-500/20 text-gray-400",
                    };

                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-white/5 transition group"
                      >
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-sm">
                          {item.firstName} {item.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {item.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-[140px] truncate">
                          {getLocation(item)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ftCfg.cls}`}
                          >
                            {ftCfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </td>

                        {/* ── Actions ── */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEmailComposer(item)}
                              className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                              title="Compose & Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal(item)}
                              className="p-1.5 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-300 text-sm">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="mt-4 text-center text-xs text-gray-600">
          Showing {franchise.length} of {pagination?.totalItems || 0}{" "}
          submissions
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL: Lead Details
      ══════════════════════════════════════════════════════════ */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/20 shadow-2xl p-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <FaHandshake className="w-8 h-8 text-blue-500" />
              <h3 className="text-2xl font-bold text-white">Lead Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              {[
                [
                  "Full Name",
                  `${selectedItem.firstName} ${selectedItem.lastName}`,
                ],
                ["Email", selectedItem.email],
                ["Location", getLocation(selectedItem)],
                selectedItem.formType === "franchisefaq" && selectedItem.state
                  ? ["State/Area", selectedItem.state]
                  : null,
                selectedItem.formType === "franchisefaq" &&
                selectedItem.territories
                  ? ["Territories", selectedItem.territories]
                  : null,
                selectedItem.formType === "franchise_kit" &&
                selectedItem.background
                  ? ["Background", selectedItem.background]
                  : null,
                selectedItem.formType === "risk_mitigation_inquiry" &&
                selectedItem.timeline
                  ? ["Timeline", selectedItem.timeline]
                  : null,
                ["Form Type", selectedItem.formType],
                ["Status", selectedItem.status || "new"],
                [
                  "Submitted",
                  new Date(selectedItem.createdAt).toLocaleString(),
                ],
              ]
                .filter(Boolean)
                .map(([label, val]) => (
                  <div
                    key={label}
                    className="flex border-b border-white/10 pb-2"
                  >
                    <span className="w-32 text-blue-400 shrink-0">
                      {label}:
                    </span>
                    <span className="text-white">{val}</span>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  closeModal();
                  openEmailComposer(selectedItem);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-center hover:bg-blue-500 transition flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Compose Email
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Email Composer
          — Pre-filled from template, fully editable, saves to DB
      ══════════════════════════════════════════════════════════ */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/20 shadow-2xl p-6">
            <button
              onClick={() => setEmailModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <Mail className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Compose Email</h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  To: {emailModal.firstName} {emailModal.lastName} &lt;
                  {emailModal.email}&gt;
                </p>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Message Body
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm font-mono resize-none"
              />
            </div>

            <p className="text-gray-600 text-xs mb-4">
              ℹ️ This email will be sent via your server's nodemailer. Status
              will auto-update to "Contacted" after sending.
            </p>

            <div className="flex gap-3">
              <button
                onClick={sendEmail}
                disabled={emailSending}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
              >
                {emailSending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {emailSending ? "Sending..." : "Send Email"}
              </button>
              <button
                onClick={() => setEmailModal(null)}
                className="px-6 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Email Template Editor
          — Edit the default templates used for each form type
      ══════════════════════════════════════════════════════════ */}
      {templateEditorOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/20 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setTemplateEditorOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <FileEdit className="w-6 h-6 text-rose-400" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Edit Email Templates
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Changes saved locally for this session. Use {"{firstName}"},{" "}
                  {"{country}"}, {"{territory}"}, {"{region}"}, {"{timeline}"}{" "}
                  as placeholders.
                </p>
              </div>
            </div>

            {/* Template selector */}
            <div className="flex gap-2 flex-wrap mb-5">
              {Object.keys(templates).map((key) => (
                <button
                  key={key}
                  onClick={() => setEditingTemplateKey(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    editingTemplateKey === key
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {key === "enquiry"
                    ? "Enquiry"
                    : key === "franchise_kit"
                      ? "Franchise Kit"
                      : key === "franchisefaq"
                        ? "FAQ Form"
                        : "Risk Mitigation"}
                </button>
              ))}
            </div>

            {/* Subject editor */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Subject Line
              </label>
              <input
                type="text"
                value={templates[editingTemplateKey].subject}
                onChange={(e) =>
                  setTemplates((prev) => ({
                    ...prev,
                    [editingTemplateKey]: {
                      ...prev[editingTemplateKey],
                      subject: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500 text-sm"
              />
            </div>

            {/* Body editor */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Email Body
              </label>
              <textarea
                value={templates[editingTemplateKey].body}
                onChange={(e) =>
                  setTemplates((prev) => ({
                    ...prev,
                    [editingTemplateKey]: {
                      ...prev[editingTemplateKey],
                      body: e.target.value,
                    },
                  }))
                }
                rows={12}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500 text-sm font-mono resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.success("Template saved for this session");
                  setTemplateEditorOpen(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl hover:from-rose-500 hover:to-rose-600 transition flex items-center justify-center gap-2 font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Template
              </button>
              <button
                onClick={() => {
                  setTemplates(DEFAULT_TEMPLATES);
                  toast.info("Templates reset to defaults");
                }}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 transition text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setTemplateEditorOpen(false)}
                className="px-5 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFranchise;
