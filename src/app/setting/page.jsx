"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import axios from "axios";
import Footer from "@/components/footer";
import { Header } from "@/components/header";

export default function Setting() {
  const router = useRouter();

  // User information state
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    currentPassword: "",
    profileImage: "",
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          router.push("/login"); // Redirect to login if no token
          return;
        }

        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser((prevUser) => ({
          ...prevUser,
          name: response.data.name,
          email: response.data.email,
          profileImage: response.data.profileImage,
          password: "",
          currentPassword: "",
        }));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Error fetching profile data");
        setLoading(false);

        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem("jwt");
          router.push("/login");
        }
      }
    };

    fetchUserData();
  }, [router]); // Add router as dependency

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Prepare form data to send to the backend
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);

      // Only append password fields if they have values
      if (user.password) {
        formData.append("password", user.password);

        // Let the backend decide when currentPassword is required.
        // For traditional accounts, the API will enforce current password.
        // For Google-only accounts with a generated password, the API will
        // allow setting a real password the first time without it.
        if (user.currentPassword) {
          formData.append("currentPassword", user.currentPassword);
        }
      }

      if (image) {
        formData.append("imageFile", image);
      }

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser({
        ...response.data,
        password: "",
        currentPassword: "",
      });

      setLoading(false);
      alert("Profile updated successfully");
      router.push("/profile"); // Redirect to profile page
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error updating profile";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && !error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-start justify-center px-4 md:px-6 py-8">
        <div className="w-full max-w-2xl p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold text-center mb-4">
            Update Your Profile
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            <span className="font-semibold">Password rules:</span> if you
            created your account with{" "}
            <span className="font-semibold">email &amp; password</span>, you{" "}
            <span className="font-semibold">
              must enter your current password
            </span>{" "}
            to change it. If you originally signed up with{" "}
            <span className="font-semibold">Google</span> and{" "}
            <span className="font-semibold">
              never set a password here before
            </span>
            , you can leave the current password field empty the first time and
            just choose a new password.
          </p>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
                disabled // Email typically shouldn't be changed in profile settings
              />
            </div>

            {/* Current Password Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <Input
                type="password"
                value={user.currentPassword}
                onChange={(e) =>
                  setUser({ ...user, currentPassword: e.target.value })
                }
                required={!!user.password} // Only required if changing password
                placeholder="Required to change password (except first time for Google accounts)"
              />
            </div>

            {/* New Password Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <Input
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Profile Image Upload */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="mt-1"
              />
              {user.profileImage && (
                <div className="mt-2 flex flex-col items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Current profile image:
                  </p>
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button type="submit" disabled={loading} className="px-6">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
