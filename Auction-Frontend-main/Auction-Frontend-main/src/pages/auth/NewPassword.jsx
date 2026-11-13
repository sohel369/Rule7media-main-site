import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { reset, ForgotNewPassword } from "../../store/auth/authSlice";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/LOGO.png";
import { Clapperboard } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

const NewPassword = () => {
  const { userId } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuccess, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
      setPassword("");
      navigate("/login");
    }
    if (isError) {
      toast.error(message);
    }
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError, message, dispatch, navigate]);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password is required");
      return;
    }
    const data = { password, userId };
    dispatch(ForgotNewPassword(data));
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black text-slate-400 px-4">
      <div className="relative w-full max-w-md bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-10 shadow-2xl overflow-hidden">
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)]"></div>

        {/* Logo + Title */}
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
            Set New Password
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Create a strong password to secure your account
          </p>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-white/5 my-6"></div>

        <form className="space-y-6" onSubmit={handlePasswordReset}>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
              Enter New Password
            </label>

            {/* Input + Eye */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-700"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[linear-gradient(135deg,#e11d48_0%,#881337_100%)] rounded-2xl font-bold text-white shadow-lg shadow-red-900/40 hover:scale-[1.02] transition-all"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
