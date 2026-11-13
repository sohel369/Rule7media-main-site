import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPasswordSendMail,
  verifyOtp,
  reset,
} from "../../store/auth/authSlice";
import { useNavigate,Link } from "react-router-dom";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import logo from "../../assets/LOGO.png";
import { Clapperboard } from "lucide-react";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSuccess, isError, message, userId } = useSelector(
    (state) => state.auth,
  );
  const country = useSelector((state) => state.country.country);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
      dispatch(reset());
      setLoading(false);
      if (step === 1) {
        setStep(2);
      } else if (step === 2 && userId) {
        navigate(`/NewPassword/${userId}`);
      }
    }

    if (isError) {
      toast.error(message);
      dispatch(reset());
      setLoading(false);
    }
  }, [isSuccess, isError, userId]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // ✅ Send OTP function
  const validateEmailDomain = (email) => {
    // Regular expression to check for valid email format with proper domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Extract domain from email
    const domain = email.split("@")[1];
    if (!domain) return false;

    const parts = domain.split(".");

    // Domain must have at least 2 parts (e.g., example.com)
    if (parts.length < 2) return false;

    // Get TLD (last part) and second-level domain
    const tld = parts[parts.length - 1].toLowerCase();
    const secondLevel =
      parts.length > 1 ? parts[parts.length - 2].toLowerCase() : "";

    // List of valid standalone TLDs (commonly used for emails)
    const validStandaloneTLDs = [
      "com",
      "org",
      "net",
      "edu",
      "gov",
      "mil",
      "int",
      "io",
      "ai",
      "app",
      "dev",
      "tech",
      "info",
      "biz",
      "name",
      "pro",
      "xyz",
      "online",
      "store",
      "site",
      "website",
      "space",
      "live",
      "world",
    ];

    // List of country code TLDs that require second-level domain
    const countryCodeTLDs = [
      "co",
      "uk",
      "us",
      "ca",
      "au",
      "in",
      "de",
      "fr",
      "jp",
      "cn",
    ];

    // Check if it's a valid standalone TLD
    if (validStandaloneTLDs.includes(tld)) {
      // For standalone TLDs, ensure the second-level domain is not empty and has minimum length
      return secondLevel.length >= 2;
    }

    // Check if it's a country code TLD
    if (countryCodeTLDs.includes(tld)) {
      // For country codes, require at least 3 parts (e.g., example.co.in)
      // OR allow if it's a common second-level + country code combo
      const validCountryCombos = ["co.in", "co.uk", "com.au", "co.jp"];
      const combo = `${secondLevel}.${tld}`;

      // Allow 3+ part domains OR valid country combos with proper domain before them
      if (parts.length >= 3) return true;
      if (validCountryCombos.includes(combo) && parts.length === 2) {
        return false; // Just "test.co.in" without a domain is invalid
      }

      return false; // Reject simple .co, .uk etc without proper structure
    }

    // Reject if TLD is not in any valid list
    return false;
  };

  // Update your handlePasswordReset function
  const handlePasswordReset = (e) => {
    e.preventDefault();

    if (email === "") {
      toast.error("Email is required");
      return;
    }

    // ✅ Validate email domain
    if (!validateEmailDomain(email)) {
      toast.error(
        "Please enter a valid email with a proper domain (e.g., .com, .org, .net)",
      );
      return;
    }

    if (!country) {
      toast.error("Country is not detected. Please try again.");
      return;
    }

    setLoading(true);
    dispatch(forgotPasswordSendMail({ email, country }));
  };

  // ✅ Verify OTP function
  const handleOtpVerification = (e) => {
    e.preventDefault();
    if (otp === "" || email === "") {
      toast.error("Email and OTP are required");
      return false;
    }
    setLoading(true);
    dispatch(verifyOtp({ email, otp }));
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black text-slate-400 px-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-16 h-16 rounded-full border-4 border-rose-900 border-t-rose-500 animate-spin"></div>
        </div>
      )}

      {/* Card */}
      <div className="relative w-full max-w-md bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-10 shadow-2xl overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)]"></div>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
              <Clapperboard className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Rule7<span className="text-red-600">Media</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-200">
            Reset Your Password
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Secure your account with OTP verification
          </p>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-white/5 my-6"></div>

        {/* STEP 1 — Email */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={handlePasswordReset}>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-700"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)] rounded-2xl font-bold text-white shadow-lg shadow-red-900/40 hover:scale-[1.02] transition-all"
            >
              Send OTP
            </button>
            <Link
  to="/login"
  className="w-full block text-center py-4 border border-white/10 rounded-2xl font-bold text-slate-300 hover:bg-white/5 transition-all"
>
  Back to Login
</Link>
          </form>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handleOtpVerification}>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-700"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)] rounded-2xl font-bold text-white shadow-lg shadow-red-900/40 hover:scale-[1.02] transition-all"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
