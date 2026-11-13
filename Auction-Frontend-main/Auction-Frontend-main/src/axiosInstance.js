import axios from "axios";
//

const API_URL = "https://www.rule7media.com/api/api/v1";

// const API_URL = "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 120000,
});

export default axiosInstance;
