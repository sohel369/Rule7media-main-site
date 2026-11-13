import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FiDatabase,
  FiBarChart2,
  FiClock,
  FiCalendar,
  FiRefreshCw,
  FiTrash2,
  FiHardDrive,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiInfo,
  FiMail,
} from "react-icons/fi";
import {
  MdBackup,
  MdRestore,
  MdDelete,
  MdStorage,
  MdWarning,
} from "react-icons/md";
import {
  fetchBackupList,
  fetchBackupStats,
  triggerBackup,
  removeBackup,
  restoreFromBackup,
  clearMessages,
} from "../../store/backup/backupSlice";

// ── Helper Functions ──────────────────────────────────────────────────────────────
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

// ✅ FIXED: Format file size from MB
const formatFileSize = (sizeMB) => {
  if (!sizeMB) return "—";
  const mb = parseFloat(sizeMB);
  if (isNaN(mb) || mb === 0) return "—";
  if (mb < 0.01) return "< 0.01 MB";
  return `${mb.toFixed(2)} MB`;
};

const StatusBadge = ({ status }) => {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <FiCheckCircle className="w-3 h-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
      <FiAlertCircle className="w-3 h-3" />
      Pending
    </span>
  );
};

// ── Stats Card Component ──────────────────────────────────────────────────────────
const StatsCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 hover:border-gray-600/50 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Icon className="text-3xl text-blue-400" />
        </div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

// ── Confirm Backup Modal ──────────────────────────────────────────────────────
const ConfirmBackupModal = ({ onConfirm, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-700 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Confirm Local Backup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <FiHardDrive className="text-blue-400 text-xl mt-0.5" />
              <div>
                <p className="font-semibold text-blue-300 text-sm">
                  Local Storage Backup
                </p>
                <p className="text-xs text-blue-400/80 mt-1">
                  Backup will be saved to server storage at: <br />
                  <code className="text-xs bg-blue-500/20 px-1 py-0.5 rounded mt-1 inline-block">
                    {process.env.REACT_APP_BACKUP_DIR || "/tmp/backups"}
                  </code>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <p className="font-medium mb-2">This operation will:</p>
            <li className="flex items-center gap-2 text-gray-400">
              <FiCheckCircle className="text-emerald-400 w-4 h-4" />
              Create a complete database dump
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <FiCheckCircle className="text-emerald-400 w-4 h-4" />
              Store backup in compressed format
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <FiCheckCircle className="text-emerald-400 w-4 h-4" />
              Send email notification upon completion
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <FiClock className="text-blue-400 w-4 h-4" />
              May take several minutes depending on database size
            </li>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold transition shadow-lg"
          >
            Create Backup
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const BackupManager = () => {
  const dispatch = useDispatch();
  const {
    backups,
    stats,
    isLoading,
    isTriggering,
    isDeleting,
    isRestoring,
    error,
    successMsg,
  } = useSelector((s) => s.backup);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data function
  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchBackupList()).unwrap(),
        dispatch(fetchBackupStats()).unwrap(),
      ]);
    } catch (err) {
      console.error("Failed to fetch backup data:", err);
    }
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 10 seconds when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAllData]);

  // Handle success/error messages
  useEffect(() => {
    if (successMsg) {
      toast.success(successMsg);
      dispatch(clearMessages());
      setTimeout(() => {
        fetchAllData();
      }, 1000);
    }
  }, [successMsg, dispatch, fetchAllData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [error, dispatch]);

  const handleConfirmBackup = async () => {
    setShowModal(false);
    const result = await dispatch(triggerBackup());
    if (result.meta.requestStatus === "fulfilled") {
      toast.info("Backup started. This may take a few minutes...");
      setTimeout(() => {
        fetchAllData();
      }, 3000);
    }
  };

  const handleDelete = async (backupName) => {
    if (
      !window.confirm(
        `⚠️ Delete "${backupName}" permanently?\n\nThis action cannot be undone!`,
      )
    )
      return;
    const result = await dispatch(removeBackup(backupName));
    if (result.meta.requestStatus === "fulfilled") {
      //toast.success("Backup deleted successfully");
      fetchAllData();
    }
  };

  const handleRestore = async (backupName) => {
    if (
      !window.confirm(
        `⚠️⚠️⚠️ DANGEROUS OPERATION ⚠️⚠️⚠️\n\nRestore database from "${backupName}"?\n\nThis will COMPLETELY OVERWRITE your current database with the backup data!\n\nMake sure you have a recent backup before proceeding.`,
      )
    )
      return;

    const result = await dispatch(restoreFromBackup(backupName));
    if (result.meta.requestStatus === "fulfilled") {
      toast.warning(
        "Restore started — Database will be restored within 2-3 minutes",
      );
      setTimeout(() => fetchAllData(), 5000);
    }
  };

  const filteredBackups = backups.filter((backup) =>
    backup.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate total backup size from MB
  const totalBackupSize = filteredBackups.reduce((total, backup) => {
    const size = parseFloat(backup.sizeMB) || 0;
    return total + size;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiDatabase className="text-xl text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Database Backup Manager
                </h1>
              </div>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <FiClock className="w-3 h-3" />
                Automated MongoDB backups — Daily at 2:00 AM IST
                {autoRefresh && (
                  <span className="text-xs text-green-400 ml-2">
                    ● Live updates
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition border ${
                  autoRefresh
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-gray-800/50 text-gray-400 border-gray-700"
                }`}
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${autoRefresh ? "animate-spin-slow" : ""}`}
                />
                Auto {autoRefresh ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => fetchAllData()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 text-sm transition disabled:opacity-50 border border-gray-700"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={FiBarChart2}
            label="Total Backups"
            value={stats?.totalBackups ?? "0"}
          />
          <StatsCard
            icon={FiClock}
            label="Last Backup"
            value={formatDate(stats?.lastBackup)}
          />
          <StatsCard
            icon={FiCalendar}
            label="Next Schedule"
            value={stats?.nextBackup ?? "2:00 AM IST"}
          />
          <StatsCard
            icon={FiHardDrive}
            label="Storage Used"
            value={
              totalBackupSize > 0 ? `${totalBackupSize.toFixed(2)} MB` : "—"
            }
          />
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setShowModal(true)}
            disabled={isTriggering}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
          >
            {isTriggering ? (
              <>
                <FiRefreshCw className="animate-spin w-4 h-4" />
                Creating Backup...
              </>
            ) : (
              <>
                <MdBackup className="w-4 h-4" />
                Create New Backup
              </>
            )}
          </button>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search backups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition w-64"
            />
          </div>
        </div>

        {/* Backup Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-200 flex items-center gap-2">
              <MdStorage className="w-4 h-4" />
              Backup History
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                {filteredBackups.length} backup
                {filteredBackups.length !== 1 ? "s" : ""}
              </span>
              {totalBackupSize > 0 && (
                <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                  Total: {totalBackupSize.toFixed(2)} MB
                </span>
              )}
            </div>
          </div>

          {isLoading && backups.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-block">
                <FiRefreshCw className="animate-spin w-8 h-8 text-blue-400 mb-4" />
              </div>
              <p className="text-gray-400">Loading backups...</p>
            </div>
          ) : filteredBackups.length === 0 ? (
            <div className="py-20 text-center">
              <FiDatabase className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-300 font-semibold">No backups found</p>
              <p className="text-gray-500 text-sm mt-1 mb-6">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Your first backup will run at 2:00 AM IST"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={isTriggering}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Create First Backup
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400 bg-gray-800/30 border-b border-gray-700/50">
                    <th className="px-6 py-3 text-left font-medium">
                      Backup Name
                    </th>
                    <th className="px-6 py-3 text-left font-medium">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left font-medium">Size</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-center font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {filteredBackups.map((backup, index) => (
                    <tr
                      key={backup.name}
                      className="hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                            <MdBackup className="text-sm text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-200 text-sm font-mono">
                              {backup.name}
                            </p>
                            {index === 0 && (
                              <span className="inline-block mt-1 text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                                Latest
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(backup.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {/* ✅ FIXED: Directly display MB from backend */}
                        {backup.sizeMB && parseFloat(backup.sizeMB) > 0 
                          ? `${parseFloat(backup.sizeMB).toFixed(2)} MB` 
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status="completed" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRestore(backup.name)}
                            disabled={isRestoring === backup.name}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition disabled:opacity-40"
                            title="Restore database from this backup"
                          >
                            {isRestoring === backup.name ? (
                              <FiRefreshCw className="animate-spin w-4 h-4" />
                            ) : (
                              <MdRestore className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(backup.name)}
                            disabled={isDeleting === backup.name}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition disabled:opacity-40"
                            title="Delete backup permanently"
                          >
                            {isDeleting === backup.name ? (
                              <FiRefreshCw className="animate-spin w-4 h-4" />
                            ) : (
                              <MdDelete className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiInfo className="text-sm text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-200 text-sm mb-2">
                Backup Policy & Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-400">
                <div className="space-y-1">
                  <li className="flex items-center gap-2">
                    • <FiClock className="w-3 h-3" /> Automatic backups run
                    daily at 2:00 AM IST
                  </li>
                  <li className="flex items-center gap-2">
                    • <MdDelete className="w-3 h-3" /> Backups older than 7 days
                    are automatically deleted
                  </li>
                  <li className="flex items-center gap-2">
                    • <FiHardDrive className="w-3 h-3" /> Backups stored locally
                    on server
                  </li>
                </div>
                <div className="space-y-1">
                  <li className="flex items-center gap-2">
                    • <MdWarning className="w-3 h-3" /> Restoring will overwrite
                    current database data
                  </li>
                  <li className="flex items-center gap-2">
                    • <FiMail className="w-3 h-3" /> Email notifications sent
                    for all backup operations
                  </li>
                  <li className="flex items-center gap-2">
                    • <FiCheckCircle className="w-3 h-3" /> Manual backups can
                    be triggered at any time
                  </li>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Box for Restore */}
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MdWarning className="text-amber-400 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 text-sm">
                ⚠️ Important Warning
              </p>
              <p className="text-xs text-amber-400/80 mt-1">
                Restoring a backup will replace your current database entirely.
                This action cannot be undone. Always ensure you have a recent
                backup before performing a restore operation.
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Backup Modal */}
        {showModal && (
          <ConfirmBackupModal
            onConfirm={handleConfirmBackup}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default BackupManager;