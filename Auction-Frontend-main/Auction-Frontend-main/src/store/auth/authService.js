import Cookies from "js-cookie";
import axiosInstance from "../../axiosInstance";

const register = async (user) => {
  const response = await axiosInstance.post(`/users/register`, user);

  return response.data;
};

const login = async (user) => {
  const response = await axiosInstance.post(`/users/login`, user);

  if (response.data.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
    Cookies.set("JwtToken", response.data.data.JwtToken, {
      expires: 1, // Expires in 7 days
      path: "/", // Accessible throughout the site
      secure: true, // Ensures the cookie is sent over HTTPS
      sameSite: "Lax", // Helps protect against CSRF attacks
    });
  }

  return response.data;
};

const logout = async () => {
  Cookies.remove("JwtToken", { path: "/" });

  const response = await axiosInstance.post(`/users/logout`, {});
  localStorage.removeItem("user");

  window.location.href = "/";
  return response.data;
};

// Send reset password email
const forgotPasswordSendMail = async (email, country) => {
  const response = await axiosInstance.post(`/users/forgot-password`, {
    email,
    country,
  });

  return response.data;
};

//verifyOtp
const verifyOtp = async (data) => {
  const response = await axiosInstance.post(`/users/verify-otp`, data);

  return response.data;
};
const ForgotNewPassword = async (data) => {
  const response = await axiosInstance.post(`/users/forgotpassword`, data);

  return response.data;
};
// Reset password
const resetNewPassword = async (data) => {
  const response = await axiosInstance.post(
    `/users/reset-password/${data.id}/${data.token}`,
    {
      password: data.password,
    },
  );
  return response.data;
};

const changeCurrentPassword = async (data) => {
  const response = await axiosInstance.put(`/users/change-password`, data);

  return response.data;
};

// Get the logged in user data

const getCurrentUser = async () => {
  const response = await axiosInstance.get(`/users/current-user`);

  if (response.data.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
  }
  return response.data;
};

const updateProfile = async (data) => {
  const response = await axiosInstance.put(`/users/update-user-profile`, data);

  return response.data;
};

const authService = {
  register,
  login,
  logout,
  forgotPasswordSendMail,
  resetNewPassword,
  changeCurrentPassword,
  getCurrentUser,
  updateProfile,
  verifyOtp,
  ForgotNewPassword,
};

export default authService;
