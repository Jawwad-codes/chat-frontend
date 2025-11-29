/** @format */

import axios from "axios";
import Cookies from "js-cookie";

export const sendOtp = async ({ email, purpose }) => {
  const response = await axios.post("http://localhost:7000/api/otp/send", {
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
    "http://localhost:7000/api/otp/verify",
    { email, otp },
    {
      headers: { Authorization: `Bearer ${authToken}` },
      withCredentials: true,
    }
  );

  return response.data;
};
