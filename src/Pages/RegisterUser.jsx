/** @format */

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { registration } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  AtSign,
  Camera,
  Loader2,
  Upload,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import Headerline from "../components/Headerline";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const registrationMutation = useMutation({
    mutationFn: registration,
    onSuccess: (data) => {
      if (data?.data?.token) {
        Cookies.set("auth_token", data.data.token, { expires: 7 });
        toast.success("Welcome aboard! Account created successfully.");
        navigate("/Home");
      } else {
        toast.error("Registration completed but no token received.");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file (JPG, PNG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, fullname } = formData;

    if (!username || !fullname) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      toast.error("Username must be between 3–20 characters");
      return;
    }

    const registrationToken = Cookies.get("registration_token");
    if (!registrationToken) {
      toast.error("Session expired. Please verify your email again.");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("username", username.trim());
    dataToSend.append("fullname", fullname.trim());
    if (avatarFile) dataToSend.append("avatar", avatarFile);

    registrationMutation.mutate(dataToSend);
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => avatarPreview && URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const isLoading = registrationMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Headerline />

      <div className="flex-1 flex flex-col lg:flex-row h-full">
        <div className="relative w-full lg:w-6/12 bg-slate-900 overflow-hidden min-h-[300px] lg:min-h-[calc(100vh-40px)] flex flex-col justify-center items-center text-center p-8 lg:p-12 text-white">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
            alt="Community"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/80"></div>

          <div className="relative z-10 max-w-md">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl">
              <Sparkles className="text-emerald-400" size={32} />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              Finish setting up your profile
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Join a community that values privacy. Customize your profile to
              let others recognize you easily.
            </p>

            <div className="flex flex-col gap-3 items-center lg:items-start opacity-80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Choose a unique username</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Add a profile picture (Optional)</span>
              </div>
            </div>
          </div>
        </div>

        {/* right side - form */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 bg-gray-50/50">
          <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                One last step
              </h2>
              <p className="text-slate-500 mt-1">
                Tell us a bit about yourself to get started.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div
                    onClick={triggerFileInput}
                    className={`
                      w-28 h-28 rounded-full cursor-pointer overflow-hidden border-4 transition-all duration-300
                      ${
                        avatarPreview
                          ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                          : "border-dashed border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                      }
                      flex items-center justify-center relative
                    `}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                        <Camera size={28} />
                        <span className="text-[10px] uppercase font-bold mt-1">
                          Upload
                        </span>
                      </div>
                    )}

                    {avatarPreview && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={24} />
                      </div>
                    )}
                  </div>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-sm hover:bg-red-600 transition-colors z-10 border-2 border-white"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Max 5MB
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between ml-1">
                    <label className="text-sm font-medium text-slate-700">
                      Username
                    </label>
                    <span
                      className={`text-xs ${
                        formData.username.length > 20
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.username.length}/20
                    </span>
                  </div>
                  <div className="relative group">
                    <AtSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                      placeholder="unique_username"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-6 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 font-medium text-base transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Complete Registration</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
