import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login, reset } from "../../store/auth/authSlice";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

import {
  HeaderLeaderboard,
  FooterLeaderboard,
  MobileStickyLeaderboard,
} from "../../components/AdSlots";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const { isError, isSuccess, message, isLoading, user } = useSelector(
    (state) => state.auth,
  );
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (isError) {
      toast.error(message, { autoClose: 1000 });
      dispatch(reset());
    }
    if (isSuccess && user) {
      toast.success(message, { autoClose: 1000 });
      if (user.userType === "admin") {
        navigate("/admin/users");
      } else if (user.userType === "advertiser") {
        navigate("/Billboard");
      } else {
        navigate("/user-profile/profile");
      }
      dispatch(reset());
    }
    return () => dispatch(reset());
  }, [isSuccess, isError, message, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(reset());
    dispatch(login(formData));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black flex flex-col">
        {/* ===== HEADER LEADERBOARD ===== */}
        <div className="pt-6 pb-4">
          <HeaderLeaderboard />
        </div>

        {/* ===== MAIN LOGIN CARD ===== */}
        <div className="flex-1 flex items-center justify-center px-4 pb-20">
          <div className="relative w-full max-w-md glass bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-10 shadow-2xl overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)]"></div>

            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-900/40">
                <Lock className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-200 mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-500 font-medium">
                Login with your Rule 7 account
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="username"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-700"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  PASSWORD
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 pr-12 text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-700"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-5 top-[46px] text-slate-600 hover:text-rose-500 transition-colors"
                >
                  {showPassword ? (
                    <FaRegEye size={18} />
                  ) : (
                    <FaRegEyeSlash size={18} />
                  )}
                </button>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-slate-900 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-bold text-rose-500 hover:text-rose-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-4 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)] rounded-2xl font-bold text-white shadow-lg shadow-red-900/40 hover:scale-[1.02] transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-500 font-medium">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-slate-200 font-bold hover:text-rose-500 transition-colors underline decoration-rose-500/30 underline-offset-4"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* ===== FOOTER LEADERBOARD ===== */}
        <div className="pb-6">
          <FooterLeaderboard />
        </div>

        {/* Mobile Sticky Leaderboard */}
        <MobileStickyLeaderboard />
      </div>
      <Footer />
    </>
  );
};

export default Login;
