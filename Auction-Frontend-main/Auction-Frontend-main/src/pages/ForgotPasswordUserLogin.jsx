import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPasswordSendMail,
  verifyOtp,
  ForgotNewPassword,
} from "../store/auth/authSlice";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPasswordUserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpId, setOtpId] = useState(""); // You might not need this anymore
  const [localUserId, setLocalUserId] = useState(""); // Renamed to avoid conflict with Redux userId
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    user,
    userId: reduxUserId,
    token,
    isLoading,
  } = useSelector((state) => state.auth);

  // Use either Redux userId or local userId
  const effectiveUserId = reduxUserId || localUserId;

  // Set email from location state or logged in user
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Start timer when OTP is sent
  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return interval;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const result = await dispatch(forgotPasswordSendMail({ email })).unwrap();
      // Store userId from the response
      if (result.userId) {
        setLocalUserId(result.userId);
      }
      setStep(2);
      startTimer();
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);

      // Focus next empty field
      const nextEmptyIndex = newOtp.findIndex((d) => !d);
      if (nextEmptyIndex !== -1) {
        document.getElementById(`otp-${nextEmptyIndex}`)?.focus();
      }
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next field
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      // Send email and OTP
      const result = await dispatch(
        verifyOtp({
          email: email, // Send the email
          otp: otpString,
        }),
      ).unwrap();

      setStep(3);
      toast.success("OTP verified successfully!");
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const result = await dispatch(forgotPasswordSendMail({ email })).unwrap();
      if (result.userId) {
        setLocalUserId(result.userId);
      }
      setOtp(["", "", "", "", "", ""]);
      startTimer();
      toast.success("New OTP sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    }
  };

  // Handle new password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!effectiveUserId) {
      toast.error("User ID not found. Please restart the process.");
      return;
    }

    try {
      const result = await dispatch(
        ForgotNewPassword({
          userId: effectiveUserId,
          token: token || "", // Make sure token is available
          password: formData.newPassword,
        }),
      ).unwrap();

      toast.success(
        "Password reset successfully! Please login with your new password.",
      );

      // Clear form and redirect
      setFormData({ newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp(["", "", "", "", "", ""]);
    } else if (step === 3) {
      setStep(2);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col w-full px-7 py-4 bg-theme-bg text-body-text-color rounded-2xl min-h-[500px]">
      <div className="flex items-center gap-3 border-b border-border-info-color pb-3 mb-5">
        <button
          onClick={handleBack}
          className="text-theme-color hover:text-white transition-colors"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-white font-bold text-xl">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
        </h2>
      </div>

      <form
        className="flex flex-col gap-5 lg:w-[50%] inputs:outline-none inputs:px-3 inputs:py-4 inputs:rounded-xl inputs:bg-theme-bg2 inputs:border inputs:border-border-info-color focus:inputs:border-theme-color border-2 p-5 my-5 rounded-xl"
        onSubmit={
          step === 1
            ? handleEmailSubmit
            : step === 2
              ? handleOtpSubmit
              : handlePasswordSubmit
        }
      >
        {/* Step 1: Email */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-slate-300 text-sm">
              Enter your email address and we'll send you a verification code to
              Forgot your password.
            </p>
            <div className="flex flex-col">
              <label className="my-2 text-lg text-white">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="text-white placeholder-body-text-color w-full pr-12 pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-slate-300 text-sm">
              We've sent a verification code to{" "}
              <span className="text-theme-color font-semibold">{email}</span>
            </p>

            <div className="flex flex-col">
              <label className="my-2 text-lg text-white">Enter OTP</label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-white text-lg font-bold bg-theme-bg2 border border-border-info-color rounded-lg focus:border-theme-color outline-none"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-slate-400 text-sm">
                {timer > 0
                  ? `Resend code in ${timer}s`
                  : "Didn't receive code?"}
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend}
                className={`text-sm font-semibold ${
                  canResend
                    ? "text-theme-color hover:underline"
                    : "text-slate-500 cursor-not-allowed"
                }`}
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-slate-300 text-sm">
              Create a new password for your account.
            </p>

            {/* New Password */}
            <div className="flex flex-col">
              <label className="my-2 text-lg text-white">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="text-white placeholder-body-text-color w-full pr-12 pl-10"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
                {/* <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /> */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-color"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Minimum 8 characters with at least 1 uppercase, 1 lowercase, 1
                number & 1 special character
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col">
              <label className="my-2 text-lg text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="text-white placeholder-body-text-color w-full pr-12 pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                {/* <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-color"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`rounded-xl px-6 py-3 text-white cursor-pointer font-bold tracking-wide w-fit bg-theme-color hover:bg-theme-color/90 transition-all mt-4 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading
            ? "Processing..."
            : step === 1
              ? "Send OTP"
              : step === 2
                ? "Verify OTP"
                : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordUserLogin;
