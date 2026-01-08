"use client";

import { useEffect, useState, Suspense } from "react";
import AuthForm from "@/components/auth-form";
import { Header } from "@/components/header";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/footer";

// Component that uses searchParams
function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [oauthError, setOauthError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set mounted state to true when component mounts in browser
    setIsMounted(true);

    // Check for JWT token only after component has mounted in browser
    if (typeof window !== "undefined" && localStorage.getItem("jwt")) {
      router.push("/");
    }

    // Check for tab parameter in URL
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }

    // Check for OAuth error parameter
    const error = searchParams.get("error");
    if (error) {
      // Map error codes to user-friendly messages
      const errorMessages = {
        oauth_failure:
          "Google authentication failed. Please try again or use email/password to login.",
        no_token: "Authentication token was not received. Please try again.",
        auth_failed: "Authentication failed. Please try again.",
      };
      setOauthError(
        errorMessages[error] ||
          "An error occurred during authentication. Please try again."
      );

      // Clear the error from URL after displaying it
      const newUrl = window.location.pathname + (tab ? `?tab=${tab}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{isLogin ? "Login" : "Register"}</h1>
        <p className="text-gray-500 mt-2">
          {isLogin
            ? "Welcome back to SmartBlog"
            : "Join the SmartBlog community"}
        </p>
      </div>

      {/* Display OAuth error if present */}
      {oauthError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{oauthError}</p>
        </div>
      )}

      {/* Only render AuthForm when component is mounted */}
      {isMounted && <AuthForm isLogin={isLogin} oauthError={oauthError} />}

      <div className="mt-6 text-center">
        {isLogin ? (
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={() => {
                setIsLogin(false);
                router.push("/login?tab=register");
              }}
              className="text-primary hover:underline font-medium">
              Register
            </button>
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => {
                setIsLogin(true);
                router.push("/login?tab=login");
              }}
              className="text-primary hover:underline font-medium">
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// Loading fallback
function LoginLoading() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Main page wrapper
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Suspense fallback={<LoginLoading />}>
          <LoginContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
