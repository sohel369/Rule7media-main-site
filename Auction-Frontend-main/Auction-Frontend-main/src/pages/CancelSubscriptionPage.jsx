import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getCode } from "country-list";
import {
  cancelSubscription,
  resetSubscription,
  checkSubscriptionStatus,
  checkstripSubscriptionStatus,
} from "../store/subscription/subscriptionSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { getContactInfo } from "../store/contact/contactSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RightSkyscraper } from "../components/AdSlots";

const CancelSubscriptionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = Cookies.get("JwtToken");
  const { user } = useSelector((state) => state.auth);

  const {
    subscriptionStatus,
    stripsubscriptionStatus,
    loading,
    message,
    error,
  } = useSelector((state) => state.subscription);
  const { contact = [], isLoading } = useSelector((state) => state.contactInfo);
  const { country } = useSelector((state) => state.country);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [cancellationData, setCancellationData] = useState(null);

  // Safe user data access
  const userCountry = user?.country || "Unknown";
  const countryCode = getCode(userCountry) || "AS";
  const userId = user?._id;
  const stripeSubscriptionId = user?.subscription?.stripeSubscriptionId;

  useEffect(() => {
    dispatch(getContactInfo());
  }, [dispatch]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!token || !userId || !stripeSubscriptionId) {
        toast.error("User or subscription information not available", {
          autoClose: 5000,
        });
        setStatusChecked(true);
        return;
      }
      try {
        await Promise.all([
          dispatch(checkSubscriptionStatus()).unwrap(),
          dispatch(checkstripSubscriptionStatus()).unwrap(),
        ]);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
        toast.error(
          err.message ||
            "Failed to load subscription status. Please try again.",
          {
            autoClose: 5000,
            position: "top-center",
          },
        );
      } finally {
        setStatusChecked(true);
      }
    };

    if (userId && stripeSubscriptionId) {
      fetchStatus();
    }
  }, [dispatch, token, userId, stripeSubscriptionId]);

  // Fetch user country if not available
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Reset subscription state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetSubscription());
    };
  }, [dispatch]);

  // Handle cancel subscription
  const handleCancel = async () => {
    if (!password.trim()) {
      toast.warning("Please enter your password to confirm cancellation", {
        autoClose: 3000,
      });
      return;
    }

    if (!stripeSubscriptionId) {
      toast.error(
        "Subscription information not available. Please contact support.",
        { autoClose: 5000 },
      );
      return;
    }

    // Check if expiry is within 2 weeks (14 days)
    const expiry = getExpiryDate();
    if (expiry) {
      const today = new Date();
      const expiryDateObj = new Date(expiry);
      const daysUntilExpiry = Math.ceil(
        (expiryDateObj - today) / (1000 * 60 * 60 * 24),
      );
    } else {
      toast.error("Unable to determine expiry date. Please contact support.", {
        autoClose: 5000,
      });
      return;
    }

    try {
      const response = await dispatch(
        cancelSubscription({
          stripeSubscriptionId: stripeSubscriptionId,
          userEmail: user?.email,
          userId: userId,
          password: password.trim(),
          countryCode,
        }),
      ).unwrap();
      toast.success("✓ Subscription cancelled successfully!", {
        autoClose: 6000,
        position: "top-right",
      });
      setCancellationData(response);
      setPassword("");

      // Immediately refresh subscription status to update cancelAtPeriodEnd
      await Promise.all([
        dispatch(checkSubscriptionStatus()).unwrap(),
        dispatch(checkstripSubscriptionStatus()).unwrap(),
      ]);

      // Force UI update by setting a local state flag
      setStatusChecked(true);

      toast.success("✓ Subscription cancelled successfully!", {
        autoClose: 6000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Cancellation failed:", err);
      // const errorMessage =
      //     err?.message?.replace(/^Error:\s*/, "") ||
      //     "Failed to cancel subscription. Please try again.";

      //   toast.error(errorMessage, {
      //     position: "top-center",
      //     autoClose: 5000,
      //     theme: "colored",
      //   });
    }
  };

  // Format date safely
  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    let date;
    try {
      if (typeof dateValue === "number") {
        // Handle Unix timestamp (check if it's seconds or milliseconds)
        date =
          dateValue > 9999999999
            ? new Date(dateValue)
            : new Date(dateValue * 1000);
      } else if (typeof dateValue === "string") {
        if (dateValue.includes("/")) {
          const [day, month, year] = dateValue.split("/");
          date = new Date(`${year}-${month}-${day}`);
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return "Invalid date";
      }

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Get expiry date
  // Get expiry date - FIXED VERSION
  const getExpiryDate = () => {
    // Priority 1: Check cancellation data
    if (cancellationData?.durationMonths) {
      return cancellationData.durationMonths;
    }

    // Priority 2: Check Stripe subscription status
    if (stripsubscriptionStatus?.durationMonths) {
      return stripsubscriptionStatus.durationMonths;
    }

    // Priority 3: Check general subscription status
    if (subscriptionStatus?.durationMonths) {
      return subscriptionStatus.durationMonths;
    }

    // Priority 4: Check user subscription data
    if (user?.subscription?.durationMonths) {
      return user.subscription.durationMonths;
    }

    // Priority 5: Calculate from subscribedAt and duration (fallback)
    if (
      stripsubscriptionStatus?.subscribedAt &&
      stripsubscriptionStatus?.durationMonths
    ) {
      const subscribedAt = new Date(stripsubscriptionStatus.subscribedAt);
      const expiry = new Date(subscribedAt);
      const duration = parseInt(stripsubscriptionStatus.durationMonths, 10);
      expiry.setMonth(subscribedAt.getMonth() + duration);
      return expiry.getTime(); // Return timestamp in milliseconds
    }

    return null;
  };

  const expiryDate = getExpiryDate();

  const isAlreadyCancelled =
    stripsubscriptionStatus?.cancelAtPeriodEnd ||
    stripsubscriptionStatus?.status === "canceled";

  // Check if expiry is at least 2 weeks away to allow cancellation
  const expiry = getExpiryDate();
  const canCancelEarly = expiry
    ? (() => {
        if (!expiry) return false;
        const today = new Date();
        const expiryDateObj = new Date(expiry);
        const daysUntilExpiry = Math.ceil(
          (expiryDateObj - today) / (1000 * 60 * 60 * 24),
        );
        return daysUntilExpiry >= 14;
      })()
    : false;

  const canCancel =
    stripsubscriptionStatus?.status === "active" &&
    !isAlreadyCancelled &&
    canCancelEarly;

  // FIXED: Separate the disabled logic for button and input fields
  const isCancelButtonDisabled =
    loading || isAlreadyCancelled || !password.trim() || !canCancelEarly;
  const isInputDisabled = loading || isAlreadyCancelled || !canCancelEarly;

  const daysValidAfterCancel =
    cancellationData?.daysValidAfterCancel ||
    stripsubscriptionStatus?.daysValidAfterCancel ||
    subscriptionStatus?.daysValidAfterCancel;

  const currentCountryContact =
    Array.isArray(contact) && contact.length > 0
      ? contact.find(
          (item) => item.country?.toLowerCase() === country?.toLowerCase(),
        ) ||
        contact.find((item) => item.country?.toLowerCase() === "australia") ||
        contact[0]
      : null;

  const getRedirectPath = () => {
    const userType = user?.userType?.toLowerCase();
    if (userType === "fleetowner" || userType === "seller") {
      return "/fleetowner-subscription";
    } else if (userType === "wrapper") {
      return "/wrapper-subscription";
    } else if (userType === "advertiser" || userType === "buyer") {
      return "/Billboard";
    }
    return "/dashboard"; // Fallback to default dashboard
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
      {/* Main Content */}
      <div className="flex-1 bg-black backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-purple-500/30">
        {/* Success Message */}
        {isAlreadyCancelled && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-900/80 to-emerald-900/80 border border-green-500/50">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-300">
                Cancellation Successful
              </h3>
            </div>
            <p className="text-green-200 text-sm">
              Your subscription will remain active until{" "}
              <b>{formatDate(expiryDate)}</b>. No further payments will be
              charged.
            </p>
          </div>
        )}

        {/* Early Cancellation Warning */}
        {!isAlreadyCancelled &&
          !canCancelEarly &&
          statusChecked &&
          expiryDate && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-yellow-900/80 to-amber-900/80 border border-yellow-500/50">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-amber-200">
                  Subscription Cancellation Unavailable
                </h3>
              </div>
              <p className="text-amber-100 text-sm leading-relaxed">
                Your subscription is set to expire on{" "}
                <b>
                  {stripsubscriptionStatus?.validUntil
                    ? formatDate(stripsubscriptionStatus.validUntil)
                    : "Not available"}
                </b>
                . Cancellations are permitted only within 14 days of expiry
                date. Please try again closer to the start of your next billing
                cycle .
              </p>
              <p className="text-amber-100 text-sm leading-relaxed">
                Reminder:{" "}
                <b>
                  An auto email will be sent to you{" "}
                  <strong>two weeks prior</strong> to your plan renewal.
                </b>
              </p>
            </div>
          )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-red-300 bg-clip-text text-transparent">
            {isAlreadyCancelled
              ? "Cancellation Complete"
              : !canCancelEarly
                ? "Cancellation Not Available"
                : "Cancel Subscription"}
          </h1>
          <p className="text-gray-400 mt-2">
            {isAlreadyCancelled
              ? "Your subscription cancellation has been processed"
              : !canCancelEarly
                ? "You can only cancel 2 weeks before expiry"
                : "Manage your subscription settings"}
          </p>
        </div>

        {/* Current Subscription Status */}
        {statusChecked && stripsubscriptionStatus ? (
          <div className="mb-8 p-6 rounded-xl bg-gray-900/60 border border-purple-500/30">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">
                Subscription Details
              </h2>
              {isAlreadyCancelled && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-900/50 border border-red-500/50 mt-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-red-300 text-sm font-medium">
                    Cancellation Processed
                  </span>
                </div>
              )}
              {/* {!isAlreadyCancelled && !canCancelEarly && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-900/50 border border-yellow-500/50 mt-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-yellow-300 text-sm font-medium">
                    Early Expiry Warning
                  </span>
                </div>
              )} */}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Status:</span>
                <span
                  className={`font-semibold ${isAlreadyCancelled ? "text-yellow-400" : canCancelEarly ? "text-green-400" : "text-yellow-400"}`}
                >
                  {stripsubscriptionStatus?.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Duration:</span>
                <span className="text-white">
                  {stripsubscriptionStatus?.durationMonths
                    ? `${stripsubscriptionStatus.durationMonths} Months`
                    : "Not specified"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Subscribed:</span>
                <span className="text-white">
                  {stripsubscriptionStatus?.subscribedAt
                    ? formatDate(stripsubscriptionStatus.subscribedAt)
                    : "Not available"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Valid Until:</span>
                <span
                  className={`text-white font-medium ${!canCancelEarly ? "text-yellow-400" : ""}`}
                >
                  {stripsubscriptionStatus?.validUntil
                    ? formatDate(stripsubscriptionStatus.validUntil)
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <svg
              className="animate-spin h-8 w-8 text-purple-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-400 mt-2">
              Loading subscription details...
            </p>
          </div>
        )}

        {/* Cancellation Section */}
        {canCancel && (
          <>
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
              <div className="flex items-start mb-2">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
                <p className="text-red-300 font-semibold">
                  Important Information
                </p>
              </div>
              <ul className="text-red-200 text-sm space-y-1 ml-7">
                <li>• Access continues until {formatDate(expiryDate)}</li>
                <li>• No further payments will be charged</li>
                <li>• This action cannot be undone immediately</li>
                <li>• Re-subscription will be required for future access</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={isInputDisabled}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  disabled={isInputDisabled}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <AiFillEyeInvisible size={20} />
                  ) : (
                    <AiFillEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleCancel}
              disabled={isCancelButtonDisabled}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                isCancelButtonDisabled
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/25"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Cancellation...
                </>
              ) : (
                "Confirm Subscription Cancellation"
              )}
            </button>
          </>
        )}

        {/* Already Cancelled Message */}
        {isAlreadyCancelled && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              Cancellation Complete
            </h3>
            <p className="text-gray-400 mb-4">
              Your subscription cancellation has been processed successfully.
            </p>
            <button
              onClick={() => (window.location.href = getRedirectPath())}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-200"
            >
              View Plan
            </button>
          </div>
        )}

        {/* Cannot Cancel Message (Early Expiry) */}
        {!isAlreadyCancelled && !canCancel && statusChecked && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">
              Cannot Cancel At This Time
            </h3>
            <p className="text-yellow-400 mb-4">
              Cancellation is only available if your subscription has less than
              2 weeks remaining before expiry. Your current plan ends soon.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-200"
            >
              Manage Plan
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <p className="text-center text-gray-400 text-sm">
            Need help?{" "}
            {currentCountryContact?.email ? (
              <a
                href={`mailto:${currentCountryContact.email}`}
                className="text-gray-300 hover:text-white transition-colors break-all"
              >
                {currentCountryContact.email}
              </a>
            ) : (
              "Contact support"
            )}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="sticky top-24 w-full lg:w-[160px]">
          <RightSkyscraper />
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionPage;
