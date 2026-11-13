import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPasswordSendMail,
  verifyOtp,
  reset,
} from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { fetchUserCountry } from "../../store/countary/countrySlice";
const ForgotPasswordProfile = () => {
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
  const handlePasswordReset = (e) => {
    e.preventDefault();

    if (email === "") {
      toast.error("Email is required");
      return;
    }

    if (!country) {
      toast.error("Country is not detected. Please try again.");
      return;
    }

    setLoading(true);
    dispatch(forgotPasswordSendMail({ email, country })); // Ensure country is passed
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
    <div className="relative flex h-screen w-full items-center justify-center bg-black text-[#7386a8]">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
        </div>
      )}

      <div className="flex w-[90%] flex-col items-center rounded-xl bg-[#071B36] py-8 sm:w-2/5 sm:px-6">
        <h1 className="text-3xl font-bold text-white">
          <span className="uppercase text-[#00A3FF]">B</span>id
          <span className="uppercase text-[#00A3FF]">F</span>air
        </h1>
        <p className="m-2 text-xl">Reset your account password</p>
        <p className="my-3 h-[1px] w-[80%] bg-[#747d9340]"></p>

        {step === 1 && (
          <form
            className="flex w-[90%] flex-col sm:w-[90%]"
            onSubmit={handlePasswordReset}
          >
            <label className="my-1 text-lg">Email Address</label>
            <input
              type="email"
              placeholder="Your Email"
              className="focus:border-1 rounded text-white border-[1px] focus:border-[#00A3FF] border-none bg-[#0E294D] px-5 py-3 outline-none mb-2"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="my-4 font-Roboto outline-none border-none w-full rounded bg-[#00A3FF] px-4 py-3 font-bold text-white"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form
            className="flex w-[90%] flex-col sm:w-[90%]"
            onSubmit={handleOtpVerification}
          >
            <label className="my-1 text-lg">Enter OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              className="focus:border-1 rounded text-white border-[1px] focus:border-[#00A3FF] border-none bg-[#0E294D] px-5 py-3 outline-none mb-2"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="my-4 font-Roboto outline-none border-none w-full rounded bg-[#00A3FF] px-4 py-3 font-bold text-white"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordProfile;
