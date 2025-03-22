"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorMsg = searchParams.get("error");

    console.log(
      "OAuth callback received. Token exists:",
      !!token,
      "Error:",
      errorMsg || "none"
    );

    if (errorMsg) {
      setError(errorMsg);
      setLoading(false);
      console.error("OAuth error received:", errorMsg);
      setTimeout(() => {
        router.push("/login?error=" + errorMsg);
      }, 2000);
      return;
    }

    if (!token) {
      setError("No authentication token received");
      setLoading(false);
      console.error("No token received in OAuth callback");
      setTimeout(() => {
        router.push("/login?error=no_token");
      }, 2000);
      return;
    }

    try {
      // Store the token in localStorage
      localStorage.setItem("jwt", token);
      console.log("JWT token stored in localStorage");

      // Decode the JWT to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT decoded successfully, user data:", {
        name: payload.name || "(not set)",
        email: payload.email || "(not set)",
      });

      // Store user data
      localStorage.setItem("username", payload.name || "");
      localStorage.setItem("email", payload.email || "");
      localStorage.setItem("profileImage", payload.profileImage || "");

      // Store the complete user object in case we need it later
      if (payload.email) {
        try {
          localStorage.setItem(
            "user_" + payload.email,
            JSON.stringify({
              name: payload.name,
              email: payload.email,
              profileImage: payload.profileImage,
            })
          );
        } catch (storageErr) {
          console.warn(
            "Failed to store user data in localStorage:",
            storageErr
          );
        }
      }

      // Redirect to home page
      setLoading(false);
      console.log("Authentication successful, redirecting to home page");
      router.push("/");
    } catch (err) {
      console.error("Error processing OAuth callback:", err);
      setError("Authentication failed: " + (err.message || "Unknown error"));
      setLoading(false);
      setTimeout(() => {
        router.push("/login?error=auth_failed");
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="text-red-500 text-xl text-center">
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirecting you to login page...
          </p>
        </div>
      ) : (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Logging you in...</h1>
          <p className="text-gray-500">
            {loading
              ? "Please wait while we complete the authentication"
              : "Authentication successful! Redirecting..."}
          </p>
        </>
      )}
    </div>
  );
}

// Loading fallback for the suspense boundary
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Loading...</h1>
      <p className="text-gray-500">Please wait while we prepare the page</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
