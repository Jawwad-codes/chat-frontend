/** @format */

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "../api/Otp";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Headerline from "../components/headerline";

export default function EmailInputPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  const sendOtpMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      const token = data?.data?.verificationToken;
      if (token) {
        Cookies.set("otp_token", token, { expires: 1, sameSite: "Lax" });
        console.log("✅ OTP token stored:", token);
      }
      toast.success(`OTP sent to ${data?.data?.email || email}`);
      setOtpSent(true);
    },
    onError: (error) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong.";
      toast.error("Error", { description: message });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      const {
        userExists,
        verified,
        registrationToken,
        token,
        user,
        needsRegistration,
      } = data?.data || {};
      console.log("Verification response data:", data);

      if (userExists) {
        toast.success("Login Successful!");
        Cookies.set("auth_token", token || user?.token, { expires: 7 });
        Cookies.remove("otp_token");
        navigate("/Home");
      } else if (needsRegistration || verified) {
        toast.info("OTP verified! Please complete registration.");
        Cookies.remove("otp_token");
        Cookies.set("registration_token", registrationToken, { expires: 1 });
        navigate("/register");
      } else {
        toast.warning("Unexpected server response.");
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid OTP. Try again.";
      toast.error("Verification Failed", { description: message });
    },
  });

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otpSent) {
      if (!email || !email.includes("@")) {
        toast.warning("Invalid Email", {
          description: "Please enter a valid email address.",
        });
        return;
      }
      sendOtpMutation.mutate({ email, purpose: "login" });
    } else {
      const token = Cookies.get("otp_token");
      const otpCode = otp.join("");

      if (!token) {
        toast.error("Session expired. Please resend OTP.");
        return;
      }

      if (otpCode.length < 6) {
        toast.warning("Incomplete OTP", {
          description: "Please enter all 6 digits.",
        });
        return;
      }

      verifyOtpMutation.mutate({ otp: otpCode, email, token });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-green-100 to-white">
      <Headerline />

      <div className="flex items-center justify-center px-4 lg:px-8 py-20">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center sm:gap-20">
            {/* Illustration on mobile & desktop */}
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <img
                src="/OTP PAGE.svg"
                alt="OTP Illustration"
                className="h-48 w-48"
              />
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary">
                  Connect Instantly with Secure Chats!
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Enter your email to receive a one-time password and start
                  chatting securely.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="w-full">
              <form
                onSubmit={handleSubmit}
                className="bg-card shadow-xl rounded-xl p-8 sm:p-10 space-y-6 border border-border"
              >
                {!otpSent && (
                  <>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-input text-foreground placeholder-muted-foreground"
                    />
                  </>
                )}

                {otpSent && (
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-10 h-12 text-center text-lg border border-input rounded-md focus:ring-2 focus:ring-primary"
                      />
                    ))}
                  </div>
                )}

                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors rounded-lg py-2"
                  type="submit"
                  disabled={
                    sendOtpMutation.isLoading || verifyOtpMutation.isLoading
                  }
                >
                  {!otpSent
                    ? sendOtpMutation.isLoading
                      ? "Sending OTP..."
                      : "Send OTP"
                    : verifyOtpMutation.isLoading
                    ? "Verifying..."
                    : "Verify OTP"}
                </Button>

                {otpSent && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => sendOtpMutation.mutate(email)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
