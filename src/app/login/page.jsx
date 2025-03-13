"use client";

import { useEffect, useState } from "react"
import AuthForm from "@/components/auth-form"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"; // Note: Use next/navigation in App Router

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter() // Call the function to get the router object

  useEffect(() => {
    // Set mounted state to true when component mounts in browser
    setIsMounted(true)
    
    // Check for JWT token only after component has mounted in browser
    if (typeof window !== 'undefined' && localStorage.getItem('jwt')) {
      router.push("/");
    }
  }, [router]); // Add router as a dependency

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{isLogin ? "Login" : "Register"}</h1>
            <p className="text-gray-500 mt-2">
              {isLogin ? "Welcome back to SmartBlog" : "Join the SmartBlog community"}
            </p>
          </div>

          {/* Only render AuthForm when component is mounted */}
          {isMounted && <AuthForm isLogin={isLogin} />}

          <div className="mt-6 text-center">
            {isLogin ? (
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <button onClick={() => setIsLogin(false)} className="text-primary hover:underline font-medium">
                  Register
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button onClick={() => setIsLogin(true)} className="text-primary hover:underline font-medium">
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
      <footer className="w-full border-t bg-gray-100 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SmartBlog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}