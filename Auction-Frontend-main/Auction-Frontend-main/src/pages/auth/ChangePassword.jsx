import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { changeCurrentPassword } from "../../store/auth/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FooterLeaderboard, RightSkyscraper } from "../../components/AdSlots";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const { isLoading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleChangeCurrentPassword = async (e) => {
    e.preventDefault();
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("All fields are required", { autoClose: 700 });
      return;
    }
    if (formData.newPassword === formData.oldPassword) {
      toast.error("New password cannot be the same as old password", {
        autoClose: 700,
      });
      return;
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
        { autoClose: 700 },
      );
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New Password and Confirm Password do not match", {
        autoClose: 700,
      });
      return;
    }
    try {
      const result = await dispatch(
        changeCurrentPassword({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      ).unwrap();
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(result.message || "Password changed successfully", {
        autoClose: 700,
        style: { color: "#000", fontWeight: "500" },
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password", {
        autoClose: 500,
      });
    }
  };

  return (
    <div className="w-full px-7 py-4 bg-theme-bg text-body-text-color rounded-2xl overflow-x-hidden">
      {/* Main row: form (left) + skyscraper (right) - both scroll normally */}
      <div className="flex flex-col lg:flex-row gap-6 justify-center">
        {/* Left: Form */}
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
            Change Password
          </h2>
          <form
            className="flex flex-col gap-5 lg:w-[50%] inputs:outline-none inputs:px-3 inputs:py-4 inputs:rounded-xl inputs:bg-theme-bg2 inputs:border inputs:border-border-info-color focus:inputs:border-theme-color border-2 p-5 my-5 rounded-xl"
            onSubmit={handleChangeCurrentPassword}
          >
            <div className="flex flex-col">
              <label className="my-2 text-lg text-white">Old Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter old Password"
                  className="text-white placeholder-body-text-color w-full pr-12"
                  value={formData.oldPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-color"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <label className="my-2 text-lg text-white">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new Password"
                  className="text-white placeholder-body-text-color w-full pr-12"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-color"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <label className="my-2 text-lg text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new Password"
                  className="text-white placeholder-body-text-color w-full pr-12"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-color"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-xl px-4 py-3 text-white font-bold w-fit bg-theme-color ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("../forgot-password-userlogin", { state: { email } })
              }
              className="text-theme-color font-semibold text-sm hover:underline w-fit"
            >
              Forgot Password?
            </button>
          </form>
        </div>
        <div className="hidden lg:block w-[160px] flex-shrink-0 self-start">
          <RightSkyscraper />
        </div>
      </div>

      {/* Footer Leaderboard */}
      <div className="w-full flex justify-center mt-12 pt-4 border-t border-white/10">
        <FooterLeaderboard />
      </div>
    </div>
  );
};

export default ChangePassword;
