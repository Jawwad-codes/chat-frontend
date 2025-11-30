/** @format */

import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  `${import.meta.env.VITE_API_URL}/auth` || "http://localhost:7000/api/auth";

export const getProfile = async () => {
  const token = Cookies.get("auth_token");
  const response = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (updatedData) => {
  const token = Cookies.get("auth_token");
  const response = await axios.put(`${API_URL}/profile`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
    "Content-Type": "multipart/form-data",
  });
  return response.data;
};

export const logoutUser = async () => {
  const token = Cookies.get("auth_token");
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  Cookies.remove("auth_token");
  return response.data;
};

export const registration = async (formData) => {
  const registrationToken = Cookies.get("registration_token");
  const response = await axios.post(
    `${API_URL}/complete-registration`,
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
