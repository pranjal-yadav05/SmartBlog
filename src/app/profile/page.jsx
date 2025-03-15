"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import Footer from "@/components/footer";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // Store posts separately
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }
    fetchUserProfile(token);
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("jwt");
          setIsLoggedIn(false);
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load profile data.");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setUserData({
        name: data.name,
        email: data.email,
        profilePicture: data.profileImage || "/placeholder.png",
      });

      setIsLoggedIn(true);
      fetchUserPosts(data.email); // Fetch posts after getting the user's email
    } catch (err) {
      setError("Network error when fetching profile data.");
      console.error("Error fetching profile:", err);
    }
  };

  const fetchUserPosts = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/user/${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }
      const posts = await response.json();
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <h2 className="text-2xl font-bold">Loading profile...</h2>
        </main>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container px-4 md:px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Please Log In</h2>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                {error || "You need to be logged in to access the profile page."}
              </p>
              <Link href="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center">
              <img
                src={userData.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
                onError={(e) => (e.target.src = "/default-profile.jpg")}
              />
              <h1 className="text-4xl font-semibold">{userData.name}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-5">{userData.email}</p>
              <Link href="/setting">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>

            {/* User's Posts */}
            <div className="mt-8">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-5 text-center">Your Posts</h2>
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle>{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                        {post.content}
                      </p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="outline">Read More</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-5">You haven't created any posts yet.</p>
                  <Link href="/blog">
                    <Button>Create Your First Post</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer/>
    </div>
  );
}
