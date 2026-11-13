import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../store/auth/authSlice";
import {
  generateOnboardingLink,
  setVerificationStatus,
  selectButtonLoading,
} from "../store/payment/paymentSlice";
import { toast } from "react-toastify";

const ReauthPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth);
  const buttonLoading = useSelector(selectButtonLoading);
  const [isProcessing, setIsProcessing] = useState(false);

  const redirectStatus = searchParams.get("redirect_status");
  const accountId = searchParams.get("account_id");
  const fromPage = searchParams.get("from") || "/user-profile/SellerOnboarding";

  useEffect(() => {
    const initializeReauth = async () => {
      setIsProcessing(true);

      try {
        // Get current user if not available
        if (!user) {
          await dispatch(getCurrentUser()).unwrap();
        }

        // Check if user is seller
        if (user?.userType !== "seller") {
          toast.error("This page is only for sellers");
          navigate("/");
          return;
        }

        // Handle Stripe redirect
        if (redirectStatus && accountId) {
          if (redirectStatus === "success") {
            toast.success("Verification completed successfully!");
            dispatch(setVerificationStatus("pending"));
          } else if (redirectStatus === "cancel") {
            toast.info(
              "Verification was cancelled. You can complete it later.",
            );
          } else {
            toast.error("Verification failed. Please try again.");
          }

          // Redirect back to original page
          navigate(fromPage, { replace: true });
          return;
        }

        // If no redirect status, start reauth process
        await startReauthProcess();
      } catch (error) {
        console.error("Reauth initialization error:", error);
        toast.error("Failed to initialize verification");
        navigate(fromPage);
      } finally {
        setIsProcessing(false);
      }
    };

    initializeReauth();
  }, [dispatch, navigate, redirectStatus, accountId, user, fromPage]);

  const startReauthProcess = async () => {
    try {
      if (!user?._id) {
        toast.error("User data not available");
        navigate("/login");
        return;
      }

      const response = await dispatch(
        generateOnboardingLink(user._id),
      ).unwrap();

      if (response.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = response.onboardingUrl;
      } else {
        throw new Error("No onboarding URL received");
      }
    } catch (error) {
      console.error("Reauth process error:", error);
      toast.error(error.message || "Failed to start verification process");
      navigate(fromPage);
    }
  };

  const handleManualRetry = () => {
    startReauthProcess();
  };

  const handleCancel = () => {
    navigate(fromPage);
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Preparing verification...
          </p>
        </div>
      </div>
    );
  }

  // This should only show if something goes wrong
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Account Verification Required
          </h2>

          <p className="mt-3 text-gray-600">
            Your account verification is required to continue. This helps us
            ensure the security of your account and payments.
          </p>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-blue-800">
              What you'll need:
            </h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Government-issued ID</li>
              <li>• Business information (if applicable)</li>
              <li>• Bank account details for payouts</li>
              <li>• 5-10 minutes of your time</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleManualRetry}
              disabled={buttonLoading}
              className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                buttonLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {buttonLoading ? "Redirecting..." : "Continue Verification"}
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            You'll be redirected to Stripe, our secure payment processor, to
            complete verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReauthPage;
