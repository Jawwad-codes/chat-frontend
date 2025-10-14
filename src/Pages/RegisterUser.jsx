/** @format */

import React from "react";
import { Button } from "@/components/ui/button";
import { registration } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Headerline from "../components/Headerline";
const RegisterUser = () => {
  const [formData, setFormData] = React.useState({
    email: "",
    username: "",
    fullname: "",
  });

  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState("");
  const navigate = useNavigate();

  // Upload avatar after registration
  const uploadAvatarAfterRegistration = async (file, authToken) => {
    console.log("Starting avatar upload...", {
      fileSize: file.size,
      fileType: file.type,
      token: authToken ? "Present" : "Missing",
    });

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    try {
      const response = await axios.post(
        "http://localhost:7000/api/auth/profile/avatar",
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Avatar upload successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Avatar upload failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  };

  const registrationMutation = useMutation({
    mutationFn: registration,
    onSuccess: async (data) => {
      console.log("Registration response:", data);

      if (data?.token) {
        Cookies.set("auth_token", data.token, { expires: 7 });

        // Upload avatar after successful registration
        if (avatarFile) {
          try {
            console.log("Starting avatar upload process...");
            toast.info("Uploading profile picture...");
            await uploadAvatarAfterRegistration(avatarFile, data.token);
            toast.success("Profile picture uploaded successfully!");
          } catch (error) {
            console.error("Avatar upload error in onSuccess:", error);
            const message =
              error.response?.data?.message ||
              "Failed to upload profile picture";
            toast.error(message, {
              description:
                "Your registration was successful, but profile picture upload failed.",
            });
          }
        } else {
          console.log("No avatar file to upload");
        }

        toast.success("Registration completed successfully!");
        setTimeout(() => navigate("/Home"), 1000);
      } else {
        console.error("No token in registration response");
        toast.error(
          "Registration completed but no authentication token received"
        );
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);

      if (error.response?.data?.details) {
        const validationErrors = {};
        error.response.data.details.forEach((detail) => {
          if (detail.message.includes("Username")) {
            validationErrors.username = detail.message;
          } else if (detail.message.includes("Email")) {
            validationErrors.email = detail.message;
          } else if (detail.message.includes("Fullname")) {
            validationErrors.fullname = detail.message;
          }
        });

        const firstError = Object.values(validationErrors)[0];
        if (firstError) {
          toast.error("Validation Error", {
            description: firstError,
          });
        }
      } else {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "An unknown error occurred";
        toast.error("Registration failed", { description: message });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files && files[0]) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      console.log("File selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.username || !formData.fullname) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Username length validation
    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error("Username must be between 3 and 20 characters");
      return;
    }

    const token = Cookies.get("registration_token");

    if (!token) {
      toast.error("Registration token not found", {
        description: "Please verify your OTP again before registering.",
      });
      return;
    }

    // Prepare registration data (without avatar for now)
    const registrationData = {
      email: formData.email.trim(),
      username: formData.username.trim(),
      fullname: formData.fullname.trim(),
    };

    console.log("Sending registration data:", registrationData);
    console.log("Avatar file present:", !!avatarFile);

    registrationMutation.mutate(registrationData);
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const isLoading = registrationMutation.isPending;

  return (
    <div>
      <Headerline />

      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-white via-green-100 to-white">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              Complete Your Registration
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Fill in your details to create your account
            </p>
          </div>

          {/* Image & Form */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Left - Illustration */}
            <div className="w-full md:w-1/2 flex justify-center items-center pt-8">
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                <img
                  src="7613.jpg"
                  alt="Registration illustration"
                  className="w-full h-auto rounded-2xl shadow-sm object-cover"
                />
              </div>
            </div>

            {/* Right - Form */}
            <div className="w-full md:w-1/2">
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200 space-y-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {" "}
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="mt-2 block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-2 block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="user123"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.username.length}/20 characters
                    </p>
                  </div>
                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Profile Picture {avatarFile && "✓"}
                    </label>
                    {avatarPreview && (
                      <div className="mb-4 flex justify-center md:justify-start">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-300">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleChange}
                      className="mt-2 block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a profile picture (JPEG, PNG, WebP, etc. Max 5MB)
                    </p>
                  </div>
                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg py-3 text-sm sm:text-base"
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
