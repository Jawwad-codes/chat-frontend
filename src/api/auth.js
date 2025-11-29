/** @format */

import axios from "axios";
import Cookies from "js-cookie";

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export const getProfile = async () => {
  const token = Cookies.get("auth_token");
  const response = await axios.get("/api/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (updatedData) => {
  const token = Cookies.get("auth_token");
  const response = await axios.put("/api/auth/profile", updatedData, {
    headers: { Authorization: `Bearer ${token}` },
    "Content-Type": "multipart/form-data",
  });
  return response.data;
};

export const logoutUser = async () => {
  const token = Cookies.get("auth_token");
  const response = await axios.post(
    "/api/auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  Cookies.remove("auth_token");
  return response.data;
};

export const registration = async (formData) => {
  const registrationToken = Cookies.get("registration_token");
  const response = await axios.post(
    "/api/auth/complete-registration",
    formData,
    {
      headers: {
        Authorization: registrationToken ? `Bearer ${registrationToken}` : "",
        "Content-Type": "multipart/form-data", // Important for sending files
      },
      withCredentials: true,
    }
  );
  return response.data;
};
