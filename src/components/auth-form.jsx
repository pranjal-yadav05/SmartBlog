"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation

const AuthForm = ({ isLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(""); // Store error message for invalid login/registration
  const router = useRouter(); // Now using App Router's useRouter

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
          const token = data.token; // Assuming the response has a token property
          localStorage.setItem("jwt", token); // Store token in localStorage
          const t = decodeJWT(token)
          localStorage.setItem('username',t.name)
          localStorage.setItem('email', t.email)
          localStorage.setItem('profileImage',t.profileImage)

        }
  
        console.log("User authenticated:", data);
        router.push("/"); // Redirect to the home page or dashboard
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Something went wrong, please try again.");
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      setError("An error occurred, please try again later.");
    }
  };
  
  const decodeJWT = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) // Decode base64 payload
      return {name: payload.name, email: payload.email, profileImage: payload.profileImage} // Return the 'name' claim from the payload
    } catch (error) {
      console.error("Failed to decode JWT", error)
      return null
    }
  }

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
              <span className="text-sm text-primary hover:underline">Forgot password?</span>
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
          <label htmlFor="remember" className="text-sm font-medium leading-none">
            Remember me
          </label>
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>} {/* Display error message */}

      <Button type="submit" className="w-full">
        {isLogin ? "Login" : "Register"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" className="w-full">
          <Github className="mr-2 h-4 w-4" />
          Github
        </Button>
        <Button variant="outline" type="button" className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Google
        </Button>
      </div>

      {!isLogin && (
        <p className="text-xs text-center text-gray-500">
          By registering, you agree to our{" "}
          <Link href="/terms">
            <span className="text-primary hover:underline">Terms of Service</span>
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