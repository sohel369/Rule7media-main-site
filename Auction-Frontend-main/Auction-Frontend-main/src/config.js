const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("railway.app")) {
      return "https://rule7media-main-site-production.up.railway.app/api";
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000/api";
    }
  }
  return "https://www.rule7media.com/api";
};

const baseUrl = getBaseUrl();
export default baseUrl;
