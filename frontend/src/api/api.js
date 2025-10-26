import axios from "axios";

const API = axios.create({
  baseURL: "https://clinic-management-system-0bga.onrender.com/api", // 🔹 backend base URL
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
