/** @format */
import axios from "axios";
import Cookies from "js-cookie";

export const registration = async (userData) => {
  const authToken = Cookies.get("registration_token");

  if (!authToken) {
    throw new Error("Missing registration token in cookies");
  }

  console.log("Sending registration data:", userData);

  const response = await axios.post(
    "http://localhost:7000/api/auth/complete-registration",
    userData,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );

  return response.data;
};
