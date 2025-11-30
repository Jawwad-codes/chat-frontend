/** @format */

import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  `${import.meta.env.VITE_API_URL}/otp` || "http://localhost:7000/api/otp";

export const sendOtp = async ({ email, purpose }) => {
  const response = await axios.post(`${API_URL}/send`, {
    email,
    purpose,
  });
  return response.data;
};

export const verifyOtp = async ({ email, otp, token }) => {
  const authToken = token || Cookies.get("otp_token");

  if (!authToken) {
    throw new Error("Token missing — please resend OTP");
  }

  console.log("Sending verification data:", {
    email,
    otp,
    token: authToken,
  });

  const response = await axios.post(
    `${API_URL}/verify`,
    { email, otp },
    {
      headers: { Authorization: `Bearer ${authToken}` },
      withCredentials: true,
    }
  );

  return response.data;
};
