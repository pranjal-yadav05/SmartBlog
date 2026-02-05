"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation

const AuthForm = ({ isLogin, oauthError }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(""); // Store error message for invalid login/registration
  const router = useRouter(); // Now using App Router's useRouter
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for registration: Confirm password match
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    const endpoint = isLogin
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: isLogin ? undefined : formData.name, // Do not send name on login
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (isLogin) {
          // Handle login success
          const token = data.token; // Assuming the response has a token property
          localStorage.setItem("jwt", token); // Store token in localStorage
          const t = decodeJWT(token);
          localStorage.setItem("username", t.name);
          localStorage.setItem("email", t.email);
          localStorage.setItem("profileImage", t.profileImage);
        } else {

          // Now perform automatic login after registration
          const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email,
                password: formData.password,
              }),
            }
          );

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const token = loginData.token;
            localStorage.setItem("jwt", token);
            const t = decodeJWT(token);
            localStorage.setItem("username", t.name);
            localStorage.setItem("email", t.email);
            localStorage.setItem("profileImage", t.profileImage);
          } else {
            // This shouldn't happen in normal circumstances
            console.error("Auto-login after registration failed");
          }
        }

        router.push("/"); // Redirect to the home page or dashboard
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Something went wrong, please try again."
        );
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      setError("An error occurred, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode base64 payload
      return {
        name: payload.name,
        email: payload.email,
        profileImage: payload.profileImage,
      }; // Return the 'name' claim from the payload
    } catch (error) {
      console.error("Failed to decode JWT", error);
      return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required={!isLogin}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {isLogin && (
            <Link href="/forgot-password">
              <span className="text-sm text-primary hover:underline">
                Forgot password?
              </span>
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isLogin}
          />
        </div>
      )}
      {isLogin && (
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none">
            Remember me
          </label>
        </div>
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}{" "}
      {/* Display error message */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLogin ? "Login" : "Register"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1">
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
          }}>
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Google
        </Button>
      </div>
      {!isLogin && (
        <p className="text-xs text-center text-gray-500">
          By registering, you agree to our{" "}
          <Link href="/terms">
            <span className="text-primary hover:underline">
              Terms of Service
            </span>
          </Link>{" "}
          and{" "}
          <Link href="/privacy">
            <span className="text-primary hover:underline">Privacy Policy</span>
          </Link>
          .
        </p>
      )}
    </form>
  );
};

export default AuthForm;
