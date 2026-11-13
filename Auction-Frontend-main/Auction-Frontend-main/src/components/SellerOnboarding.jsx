import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser } from "../store/auth/authSlice";
import {
  fetchEarnings,
  fetchStripeAccountStatus,
  fetchSellerOnboarding,
  fetchPayoutMethods,
  generateOnboardingLink,
  generateUpdateLink,
  setVerificationStatus,
  selectEarnings,
  selectOnboardingUrl,
  selectVerificationStatus,
  selectPayoutMethods,
  selectStripeAccount,
  selectLoading,
  selectButtonLoading,
} from "../store/payment/paymentSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select data from Redux store
  const { user } = useSelector((state) => state.auth);
  const earnings = useSelector(selectEarnings);
  const onboardingUrl = useSelector(selectOnboardingUrl);
  const verificationStatus = useSelector(selectVerificationStatus);
  const payoutMethods = useSelector(selectPayoutMethods);
  const stripeAccount = useSelector(selectStripeAccount);
  const loading = useSelector(selectLoading);
  const buttonLoading = useSelector(selectButtonLoading);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (user && user.userType === "seller" && user._id) {
        try {
          const onboardingResponse = await dispatch(
            fetchSellerOnboarding(user._id),
          ).unwrap();

          if (onboardingResponse.accountId) {
            const accountData = await dispatch(
              fetchStripeAccountStatus(onboardingResponse.accountId),
            ).unwrap();

            if (accountData.isVerified) {
              dispatch(setVerificationStatus("verified"));
              await dispatch(fetchPayoutMethods(onboardingResponse.accountId));
            } else if (accountData.isPending) {
              dispatch(setVerificationStatus("pending"));
            } else {
              dispatch(setVerificationStatus("unverified"));
            }
          } else {
            dispatch(setVerificationStatus("unverified"));
          }
        } catch (error) {
          toast.error("Failed to load seller information");
          console.error("Error fetching initial data:", error);
        }
      }
    };

    const queryParams = new URLSearchParams(window.location.search);
    const redirectFrom = queryParams.get("redirect_from");
    const reauthParam = queryParams.get("reauth");
    const status = queryParams.get("status");
    const success = queryParams.get("success");

    const initialize = async () => {
      if (!user) {
        try {
          await dispatch(getCurrentUser()).unwrap(); // Wait for user to load
        } catch (error) {
          toast.error("Failed to load user data");
          console.error("Error fetching user:", error);
          navigate("/login");
          return; // Exit if user fetch fails
        }
      }

      if (user?.userType !== "seller") {
        toast.error("This page is only accessible to sellers");
        navigate("/"); // Redirect non-sellers
        return;
      }

      if (reauthParam) {
        toast.info("Please complete your verification process");
        await dispatch(generateOnboardingLink(user._id));
      }

      if (redirectFrom === "stripe") {
        if (status === "reauth") {
          toast.info("Please complete your verification process");
        } else if (status === "success") {
          toast.success("Account updated successfully");
        }
        await fetchInitialData();
        navigate("/user-profile/SellerOnboarding", { replace: true });
      }

      if (success) {
        toast.success("Verification completed successfully!");
        await fetchInitialData();
        navigate("/user-profile/SellerOnboarding", { replace: true });
      }

      await fetchInitialData();

      if (user?._id) {
        dispatch(fetchEarnings(user._id));
      }
    };

    initialize();
  }, [dispatch, navigate]); // Remove user._id from deps to avoid re-runs on user change

  const handleOnboardingClick = async () => {
    try {
      if (!user?._id) {
        toast.error("User data not loaded. Please try again.");
        return;
      }

      let url = onboardingUrl;
      if (!url) {
        const response = await dispatch(
          generateOnboardingLink(user._id),
        ).unwrap();
        url = response.onboardingUrl;
      }

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to generate onboarding URL");
      }
    } catch (error) {
      toast.error(error.message || "Failed to start verification");
      console.error("Onboarding error:", error);
    }
  };

  const handleUpdateLink = async () => {
    try {
      const response = await dispatch(generateUpdateLink(user._id)).unwrap();
      if (response.updateUrl) {
        window.location.href = response.updateUrl;
      }
    } catch (error) {
      toast.error(error || "Failed to generate update link");
    }
  };

  const renderVerificationStatus = () => {
    const hasBankAccount = payoutMethods.length > 0;
    const requirements = stripeAccount?.requirements;

    if (verificationStatus === "verified") {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                Account Verified
              </h3>
              <div className="mt-2 text-green-700">
                <p>
                  Your bank account is fully verified and ready to receive
                  payments.
                </p>
              </div>
              {hasBankAccount && (
                <div className="mt-4 bg-green-100 p-3 rounded-md">
                  <p className="text-sm font-medium text-green-800">
                    Connected Bank Account:
                  </p>
                  <p className="text-green-700 font-medium mt-1">
                    {payoutMethods[0].bank_name} •••• {payoutMethods[0].last4}
                  </p>
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={handleUpdateLink}
                  disabled={buttonLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                    buttonLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {buttonLoading ? "Processing..." : "Update Account Details"}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (verificationStatus === "pending") {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Verification Pending
              </h3>
              <div className="mt-2 text-yellow-700">
                <p>
                  Your verification is in progress with Stripe. This may take
                  1-2 business days.
                </p>
              </div>
              {requirements?.currently_due?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Additional information required:
                  </h4>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                    {requirements?.currently_due.map((item, index) => (
                      <li key={index}>{item.replace(/_/g, " ")}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">
                Verification Required
              </h3>
              <div className="mt-2 text-red-700">
                <p>
                  Please complete the Stripe onboarding process to start
                  selling.
                </p>
              </div>
              {requirements?.currently_due?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-800">
                    Missing information:
                  </h4>
                  <ul className="mt-1 text-sm text-red-700 list-disc pl-5 space-y-1">
                    {requirements.currently_due.map((item, index) => (
                      <li key={index}>{item.replace(/_/g, " ")}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderActionButton = () => {
    if (verificationStatus === "verified") {
      return (
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full md:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Go to Dashboard
        </button>
      );
    }

    return (
      <button
        onClick={handleOnboardingClick}
        disabled={buttonLoading}
        className={`w-full md:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          buttonLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {buttonLoading
          ? "Processing..."
          : verificationStatus === "pending"
            ? "Continue Verification"
            : "Start Verification"}
      </button>
    );
  };

  return (
    <div className="flex flex-col w-full bg-theme-bg rounded-2xl md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:space-x-8">
          {/* Main Content */}
          <div className="md:w-2/3">
            <div className="bg-theme-bg2 shadow rounded-lg p-6 mb-8 text-white">
              <div className="border-b border-gray-200 pb-4 mb-6 text-white">
                <h1 className="text-2xl font-bold text-white-900">
                  Seller Account Verification
                </h1>
                <p className="mt-1 text-sm text-white-500">
                  Complete your account verification to start receiving payments
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {renderVerificationStatus()}

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Verification Process
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Complete your business information
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Verify your identity
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Add a bank account for payouts
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-blue-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Processing typically takes 1-2 business days
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">{renderActionButton()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="md:w-1/3">
            <div className="bg-theme-bg2 shadow rounded-lg p-6 mb-8 text-white">
              <h2 className="text-lg font-bold text-white-900 mb-4">
                Your Earnings Summary
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800">
                    Available Now
                  </h3>
                  <p className="text-2xl font-semibold text-blue-900">
                    {earnings.available} {earnings.currency}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Ready for withdrawal
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800">
                    Pending Clearance
                  </h3>
                  <p className="text-2xl font-semibold text-purple-900">
                    {earnings.pending_clearance} {earnings.currency}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Will be available in 2-7 days
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800">
                    Lifetime Earnings
                  </h3>
                  <p className="text-2xl font-semibold text-green-900">
                    {earnings.lifetime_total} {earnings.currency}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Total since joining
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-800">
                    Already Paid Out
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {earnings.already_paid_out}{" "}
                    {earnings.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Transferred — should reflect in your bank within 2–7
                    business days
                  </p>
                </div>
              </div>
            </div>

            {/* Currency Breakdown */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Balance by Currency
              </h3>
              <div className="space-y-3">
                {earnings.breakdown.available_by_currency.map((currency) => (
                  <div
                    key={currency.currency}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {currency.currency}:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {currency.amount} (Available)
                    </span>
                  </div>
                ))}
                {earnings.breakdown.pending_by_currency.map((currency) => (
                  <div
                    key={currency.currency}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {currency.currency}:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {currency.amount} (Pending)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;
