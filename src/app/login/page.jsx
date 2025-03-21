"use client";

import { useEffect, useState } from "react";
import AuthForm from "@/components/auth-form";
import { Header } from "@/components/header";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import Footer from "@/components/footer";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
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
  }, [router, searchParams]); // Add searchParams as a dependency

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              {isLogin ? "Login" : "Register"}
            </h1>
            <p className="text-gray-500 mt-2">
              {isLogin
                ? "Welcome back to SmartBlog"
                : "Join the SmartBlog community"}
            </p>
          </div>

          {/* Only render AuthForm when component is mounted */}
          {isMounted && <AuthForm isLogin={isLogin} />}

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
      </main>
      <Footer />
    </div>
  );
}
