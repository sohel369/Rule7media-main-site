import axiosInstance from "../../axiosInstance";

// Submit enquiry
export const submitEnquiry = async (enquiryData) => {
  const response = await axiosInstance.post(`/enquiries/enquiry`, enquiryData);
  return response.data;
};

// Get all enquiries (Admin)
export const getAllEnquiries = async () => {
  const response = await axiosInstance.get(`/enquiries/all`);
  return response.data;
};

// Get single enquiry (Admin)
export const getEnquiryById = async (id) => {
  const response = await axiosInstance.get(`/enquiries/${id}`);
  return response.data;
};

// Update enquiry status (Admin)
export const updateEnquiryStatus = async (id, status) => {
  const response = await axiosInstance.put(`/enquiries/${id}`, { status });
  return response.data;
};

const enquiryService = {
  // Fixed service name
  submitEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
};

export default enquiryService;
