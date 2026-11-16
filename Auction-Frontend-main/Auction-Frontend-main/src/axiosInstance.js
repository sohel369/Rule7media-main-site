import axios from "axios";
//

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("railway.app")) {
      return "https://rule7media-main-site-production.up.railway.app/api/v1";
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000/api/v1";
    }
  }
  return "https://www.rule7media.com/api/v1";
};

const API_URL = getApiUrl();

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 120000,
});

export default axiosInstance;
