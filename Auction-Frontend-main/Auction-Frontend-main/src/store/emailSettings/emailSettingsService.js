import axios from "axios";
import baseUrl from "../../config";

// Setup axios with token
const API = axios.create({ baseURL: baseUrl });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")
    ? JSON.parse(localStorage.getItem("token"))
    : null;
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const getEmailSettings = async () => {
  const response = await API.get("/api/v1/admin/email-settings");
  return response.data.data;
};

const createEmailSettings = async (settingsData) => {
  const response = await API.post("/api/v1/admin/email-settings", settingsData);
  return response.data.data;
};

const updateEmailSettings = async (settingsData) => {
  const response = await API.put("/api/v1/admin/email-settings", settingsData);
  return response.data.data;
};

const emailSettingsService = {
  getEmailSettings,
  createEmailSettings,
  updateEmailSettings,
};

export default emailSettingsService;
