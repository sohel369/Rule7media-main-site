import axiosInstance from "../../axiosInstance";

// ─── Public APIs ────────────────────────────────────────────────────────────
const fetchAvailableKits = async (country = "") => {
  const query = country ? `?country=${encodeURIComponent(country)}` : "";
  const response = await axiosInstance.get(`/media-leads/available-kits${query}`);
  return response.data;
};

const downloadMediaKit = async (data) => {
  try {
    const response = await axiosInstance.post("/media-leads/download", data);
    return response.data;
  } catch (error) {
    console.error("❌ Media Kit Download Error:", error.response?.data || error.message);
    throw error;
  }
};

// ─── Admin APIs ─────────────────────────────────────────────────────────────
const fetchAdminLanguageKits = async (country = "Global") => {
  const query = country ? `?country=${encodeURIComponent(country)}` : "";
  const response = await axiosInstance.get(`/media-leads/admin/language-kits${query}`);
  return response.data;
};

const uploadKit = async (file, language = "en", languageName = "English", onProgress = null, country = "Global") => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("country", country || "Global");
  formData.append("language", language);
  formData.append("languageName", languageName);

  const response = await axiosInstance.post("/media-leads/admin/upload-kit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000, // 5 minutes for large file uploads
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
  });
  return response.data;
};

const deleteLanguageKit = async (language, country = "Global") => {
  const query = country ? `?country=${encodeURIComponent(country)}` : "";
  const response = await axiosInstance.delete(`/media-leads/admin/kit/${language}${query}`);
  return response.data;
};

const fetchDownloads = async (page = 1, limit = 10, language = "all", search = "") => {
  let url = `/media-leads/admin/downloads?page=${page}&limit=${limit}`;
  if (language && language !== "all") url += `&language=${encodeURIComponent(language)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

const fetchKitHistory = async (page = 1, limit = 10, language = "all") => {
  let url = `/media-leads/admin/kit-history?page=${page}&limit=${limit}`;
  if (language && language !== "all") url += `&language=${encodeURIComponent(language)}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

const deleteDownloadRecord = async (id) => {
  const response = await axiosInstance.delete(`/media-leads/admin/downloads/${id}`);
  return response.data;
};

const deleteActiveKit = async () => {
  const response = await axiosInstance.delete("/media-leads/admin/active-kit");
  return response.data;
};

const mediaKitService = {
  fetchAvailableKits,
  downloadMediaKit,
  fetchAdminLanguageKits,
  uploadKit,
  deleteLanguageKit,
  fetchDownloads,
  fetchKitHistory,
  deleteDownloadRecord,
  deleteActiveKit,
};

export default mediaKitService;