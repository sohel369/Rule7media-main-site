
import axiosInstance from "../../axiosInstance";

// Send OTP to admin email
export const sendDeletionOTP = async (email) => {
  const response = await axiosInstance.post(`/delete-data/send-otp`, { email });
  return response.data;
};

// Resend OTP
export const resendDeletionOTP = async (email) => {
  const response = await axiosInstance.post(`/delete-data/resend-otp`, { email });
  return response.data;
};

// Verify OTP
export const verifyDeletionOTP = async (email, otp) => {
  const response = await axiosInstance.post(`/delete-data/verify-otp`, { email, otp });
  return response.data;
};

// Delete all data
export const deleteAllData = async (deletionToken, confirmText, email) => {
  const response = await axiosInstance.post(`/delete-data/delete-all`, { 
    deletionToken, 
    confirmText,
    email 
  });
  return response.data;
};

// Check deletion status
export const checkDeletionStatus = async (email) => {
  const response = await axiosInstance.get(`/delete-data/status`, { 
    params: { email } 
  });
  return response.data;
};

const deleteDataService = {
  sendDeletionOTP,
  resendDeletionOTP,
  verifyDeletionOTP,
  deleteAllData,
  checkDeletionStatus,
};

export default deleteDataService;