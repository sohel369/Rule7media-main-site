import axiosInstance from "../../axiosInstance";

export const getFranchise = async ({ page, limit, formType, search }) => {
  const response = await axiosInstance.get("/franchise", {
    params: { page, limit, formType, search },
  });
  return response.data;
};

export const addFranchise = async (formData) => {
  const response = await axiosInstance.post(
    "/franchise/add-franchise",
    formData,
  );
  return response.data;
};
export const sendEmail = async ({ to, subject, body }) => {
  const response = await axiosInstance.post("/franchise/send-email", {
    to,
    subject,
    body,
  });
  return response.data;
};
export const updateStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/franchise/${id}/status`, {
    status,
  });
  return response.data;
};
export const deleteFranchise = async (id) => {
  const response = await axiosInstance.delete(`/franchise/${id}`);
  return response.data;
};
const franchiseService = {
  getFranchise,
  addFranchise,
  deleteFranchise,
  sendEmail,
};

export default franchiseService;
