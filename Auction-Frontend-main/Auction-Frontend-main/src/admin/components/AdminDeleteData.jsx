// components/Admin/AdminDeleteData.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import {
  sendDeletionOTP,
  resendDeletionOTP,
  verifyDeletionOTP,
  deleteAllData,
  checkDeletionStatus,
  reset,
  clearMessage,
  setEmail as setEmailAction,
  startResendTimer,
  decrementResendTimer,
} from '../../store/deleteData/deleteDataSlice';

const AdminDeleteData = () => {
  const dispatch = useDispatch();
  const {
    step,
    email,
    deletionToken,
    results,
    summary,
    canResend,
    resendTimer,
    expiresIn,
    isLoading,
    isError,
    isSuccess,
    message,
    errorType,
  } = useSelector((state) => state.deleteData);

  const [otp, setOtp] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [timer, setTimer] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Toast Messages
  useEffect(() => {
    if (isError && message) {
      if (errorType === 'UNAUTHORIZED_ADMIN') {
        toast.error('Unauthorized access. Only administrators can perform this action.', {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
      } else {
        toast.error(message, {
          position: "top-right",
          autoClose: 4000,
          theme: "dark",
        });
      }
    }
  }, [isError, message, errorType]);

  useEffect(() => {
    if (isSuccess && message && step !== 'completed') {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  }, [isSuccess, message, step]);

  useEffect(() => {
    if (step === 'otp' && email) {
      toast.success(`📧 Verification code sent to: ${email}`, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
      });
    }
  }, [step, email]);

  // Timer for OTP expiry
  useEffect(() => {
    if (step === 'otp' && expiresIn > 0) {
      setTimer(expiresIn);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            toast.warning('OTP has expired. Please request a new verification code.', {
              position: "top-right",
              autoClose: 4000,
              theme: "dark",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, expiresIn]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0 && step === 'otp') {
      const interval = setInterval(() => {
        dispatch(decrementResendTimer());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer, step, dispatch]);

  // Auto clear messages
  useEffect(() => {
    if (isSuccess || isError) {
      const timeout = setTimeout(() => {
        dispatch(clearMessage());
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, isError, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    if (!localEmail) {
      toast.error('Please enter administrator email address', {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    
    const loadingToast = toast.loading('Verifying administrator credentials...', {
      position: "top-right",
      theme: "dark",
    });
    
    dispatch(setEmailAction(localEmail));
    await dispatch(sendDeletionOTP(localEmail));
    await dispatch(checkDeletionStatus(localEmail));
    
    toast.dismiss(loadingToast);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    const loadingToast = toast.loading('Resending verification code...', {
      position: "top-right",
      theme: "dark",
    });
    
    await dispatch(resendDeletionOTP(email));
    await dispatch(checkDeletionStatus(email));
    dispatch(startResendTimer());
    
    toast.dismiss(loadingToast);
    toast.success('New verification code sent to your email', {
      position: "top-right",
      autoClose: 3000,
      theme: "dark",
    });
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code', {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    
    const loadingToast = toast.loading('Verifying code...', {
      position: "top-right",
      theme: "dark",
    });
    
    await dispatch(verifyDeletionOTP({ email, otp }));
    
    toast.dismiss(loadingToast);
  };

  const handleDeleteData = async () => {
    if (confirmText !== 'DELETE_ALL_DATA') {
      toast.error('Please type "DELETE_ALL_DATA" to confirm this action', {
        position: "top-right",
        autoClose: 4000,
        theme: "dark",
      });
      return;
    }
    
    const confirmDelete = window.confirm(
      '⚠️ DATA DELETION CONFIRMATION ⚠️\n\nThis action will permanently remove ALL data from the database including:\n• All user accounts\n• All admin accounts\n• All collections data\n\nDatabase structure and indexes will remain intact.\n\n⚠️ THIS OPERATION CANNOT BE UNDONE ⚠️\n\nAre you absolutely sure you want to proceed?'
    );
    
    if (confirmDelete) {
      const loadingToast = toast.loading('Processing data deletion... Please wait.', {
        position: "top-right",
        theme: "dark",
      });
      
      await dispatch(deleteAllData({ deletionToken, confirmText, email }));
      
      toast.dismiss(loadingToast);
    }
  };

  const handleReset = () => {
    dispatch(reset());
    setOtp('');
    setConfirmText('');
    setLocalEmail('');
    setShowDetails(false);
    toast.success('Operation cancelled successfully', {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    });
  };

  useEffect(() => {
    if (step === 'completed' && summary) {
      toast.success(
        `Data deletion completed. ${summary.totalDeleted} records removed from ${summary.successful} collections.`,
        {
          position: "bottom-right",
          autoClose: 6000,
          theme: "dark",
        }
      );
    }
  }, [step, summary]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 rounded-2xl">
      <div className="max-w-4xl mx-auto">
       
    

        {/* Page Title */}
        <div className="mb-6">
  <h1 className="text-2xl md:text-3xl font-bold text-white">Bulk Data Deletion</h1>
  <p className="text-gray-400 text-sm mt-1">Securely erase all records from the database</p>
</div>
        {/* Main Card */}
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Card Header */}
          <div className="border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Database Cleanup</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Securely remove all data from the database
                </p>
              </div>
              <div className="bg-red-900/30 rounded-lg px-3 py-1 border border-red-500/30">
                <span className="text-red-400 text-xs font-medium">Restricted Access</span>
              </div>
            </div>
          </div>

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Administrator Email
                </label>
                <input
                  type="email"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Only authorized administrator accounts can perform this operation
                </p>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={isLoading || !localEmail}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>📧</span> Send Verification Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="p-6">
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="text-blue-300 text-sm">
                      Verification code sent to: <strong className="text-blue-200">{email}</strong>
                    </p>
                    <p className="text-blue-400 text-xs mt-1">
                      Check your email inbox (including spam folder)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-wider text-white"
                  disabled={isLoading}
                  autoFocus
                />
                {timer > 0 && (
                  <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
                    <span>⏰</span> Code expires in:
                    <span className={`font-medium ${timer < 60 ? "text-red-400" : "text-gray-300"}`}>
                      {formatTime(timer)}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200 font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span>✓</span> Verify Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className={`px-6 py-2.5 rounded-lg border transition duration-200 font-medium ${
                    canResend
                      ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-600"
                      : "bg-gray-900 text-gray-500 cursor-not-allowed border-gray-700"
                  }`}
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend Code"}
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-3 text-gray-500 py-2 rounded-lg hover:text-gray-400 transition text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {step === "confirm" && (
            <div className="p-6">
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="text-red-400 font-semibold">Confirmation Required</p>
                    <p className="text-gray-400 text-sm mt-1">
                      This operation will permanently delete all data from the database including:
                      <strong className="text-red-400 block mt-1">• All user accounts • All admin accounts • All collections data</strong>
                      Database structure and indexes will remain intact.
                      This action cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Type <span className="text-red-400 font-mono bg-red-900/30 px-2 py-0.5 rounded">"DELETE_ALL_DATA"</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE_ALL_DATA"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button
                onClick={handleDeleteData}
                disabled={isLoading || confirmText !== "DELETE_ALL_DATA"}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>🗑️</span> Confirm Data Deletion
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="w-full mt-3 text-gray-500 py-2 rounded-lg hover:text-gray-400 transition text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step 4: Completion */}
          {step === "completed" && (
            <div className="p-6">
              <div className="bg-green-900/30 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-green-400 font-semibold">Operation Complete</p>
                    <p className="text-gray-400 text-sm mt-1">{message}</p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                    <div className="text-2xl font-bold text-blue-400">
                      {summary.totalDeleted.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Records Deleted</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                    <div className="text-2xl font-bold text-green-400">
                      {summary.successful}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Tables Cleaned</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                    <div className="text-2xl font-bold text-orange-400">
                      {summary.collectionsProcessed}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Total Processed</div>
                  </div>
                </div>
              )}

              {/* Results Details */}
              {results && results.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full bg-gray-800 text-gray-300 py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <span>{showDetails ? "▲" : "▼"}</span>
                    {showDetails ? "Hide Details" : "View Details"}
                  </button>

                  {showDetails && (
                    <div className="mt-3 max-h-60 overflow-y-auto bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      {results.map((result, idx) => (
                        <div key={idx} className="text-sm p-2 border-b border-gray-700 last:border-0">
                          {result.status === "success" ? (
                            <div className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <div>
                                <span className="text-gray-300 font-mono text-xs">{result.model}</span>
                                <span className="text-gray-500 text-xs ml-2">({result.collection})</span>
                                <div className="text-gray-400 text-xs">
                                  {result.deletedCount.toLocaleString()} records removed
                                  {result.note && <span className="text-yellow-500 ml-2">({result.note})</span>}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="text-red-400">✗</span>
                              <div>
                                <span className="text-gray-300 font-mono text-xs">{result.model}</span>
                                <div className="text-red-400 text-xs">Failed: {result.error}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-600 transition font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-400 text-lg">ℹ️</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">About this operation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                <ul className="space-y-1">
                  <li className="text-gray-400">• Requires administrator authentication</li>
                  <li className="text-gray-400">• Email verification code valid for 10 minutes</li>
                  <li className="text-gray-400">• Deletion token expires after 5 minutes</li>
                </ul>
                <ul className="space-y-1">
                  <li className="text-gray-400">• Database schema and indexes preserved</li>
                  <li className="text-gray-400">• All actions logged for audit trail</li>
                  <li className="text-gray-400 text-red-400">• Operation cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDeleteData;