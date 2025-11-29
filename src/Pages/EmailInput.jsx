/** @format */

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "../api/Otp";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Edit2,
  Sparkles,
} from "lucide-react";
import Headerline from "../components/Headerline";

export default function EmailInputPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (otpSent && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [otpSent]);

  const sendOtpMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      const token = data?.data?.verificationToken;
      if (token) {
        Cookies.set("otp_token", token, { expires: 1, sameSite: "Lax" });
      }
      toast.success("Code sent!", {
        description: `Check your inbox at ${email}`,
      });
      setOtpSent(true);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to send OTP.";
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

      if (userExists) {
        toast.success("Welcome back!");
        Cookies.set("auth_token", token || user?.token, { expires: 7 });
        Cookies.remove("otp_token");
        navigate("/Home");
      } else if (needsRegistration || verified) {
        toast.info("Verified! Let's complete your profile.");
        Cookies.remove("otp_token");
        Cookies.set("registration_token", registrationToken, { expires: 1 });
        navigate("/register");
      } else {
        toast.warning("Unexpected server response.");
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Invalid code. Please try again.";
      toast.error("Verification Failed", { description: message });
    },
  });

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move forward
      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }

      // Auto-submit on last digit
      if (value && index === 5 && !newOtp.includes("")) {
        // Optional: You could trigger submit here automatically
      }
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
        toast.error("Session expired. Please resend code.");
        return;
      }

      if (otpCode.length < 6) {
        toast.warning("Incomplete Code", {
          description: "Please enter all 6 digits.",
        });
        return;
      }

      verifyOtpMutation.mutate({ otp: otpCode, email, token });
    }
  };

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Headerline />

      <div className="flex-1 flex flex-col lg:flex-row h-full">
        <div className="relative w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[calc(100vh-40px)] bg-slate-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
            alt="People connecting"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent lg:bg-gradient-to-r lg:from-slate-900/90 lg:to-slate-900/40"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center lg:items-start p-8 lg:p-16 text-white z-10">
            <div className="hidden lg:flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 w-fit">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-sm font-medium tracking-wide">
                End-to-End Encrypted
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-center lg:text-left drop-shadow-lg">
              Connect without <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                compromise.
              </span>
            </h1>

            <p className="mt-4 text-slate-300 text-lg max-w-md text-center lg:text-left hidden lg:block">
              Experience the next generation of secure messaging. Simple, fast,
              and private by design.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative -mt-10 lg:mt-0 z-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl lg:shadow-none border border-gray-100 lg:border-none p-8 sm:p-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4 lg:hidden">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {otpSent ? "Check your inbox" : "Get started"}
              </h2>
              <p className="mt-2 text-slate-500 text-sm sm:text-base">
                {otpSent ? (
                  <>
                    We sent a temporary code to <br className="lg:hidden" />
                    <span className="font-semibold text-slate-800">
                      {email}
                    </span>
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp(Array(6).fill(""));
                      }}
                      className="ml-2 text-emerald-600 hover:underline text-xs"
                    >
                      Change
                    </button>
                  </>
                ) : (
                  "Enter your email to sign in or create a new account."
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!otpSent ? (
                // EMAIL STEP
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // OTP STEP
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`
                          w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                          ${
                            digit
                              ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
                              : "border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                          }
                        `}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        sendOtpMutation.mutate({ email, purpose: "login" })
                      }
                      disabled={isLoading}
                      className="text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      Didn't get the code?{" "}
                      <span className="font-semibold underline">Resend</span>
                    </button>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>
                      {otpSent ? "Verify Code" : "Continue with Email"}
                    </span>
                    {!otpSent && <ArrowRight size={18} />}
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
