"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // Store posts separately
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6; // Smaller page size for profile view
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

  // Add a separate useEffect to handle pagination and fetch posts once profile is loaded
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (userData && userData.email && token) {
      fetchUserPosts(userData.email);
    }
  }, [currentPage, userData]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        mode: "cors", // Explicitly set CORS mode
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("username");
          localStorage.removeItem("email");
          localStorage.removeItem("profileImage");
          setIsLoggedIn(false);
          setError("Your session has expired. Please log in again.");
        } else {
          setError(`Failed to load profile data (${response.status}).`);
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
      setIsLoading(false);
    } catch (err) {
      localStorage.removeItem("jwt"); // Clear token on error
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("profileImage");
      setIsLoggedIn(false);
      setError(
        "Network error when fetching profile data. Please try again later."
      );
      console.error("Error fetching profile:", err);
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (email) => {
    try {
      // Use the paginated endpoint
      const response = await fetch(
        `${API_URL}/api/posts/user/${email}/paginated?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          credentials: "include",
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }

      const data = await response.json();
      setUserPosts(data.content);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Remove scroll to top behavior
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingScreen message="Loading profile... Fetching your details." />;
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
              Please Log In
            </h2>
            <p className="text-gray-500 md:text-xl dark:text-gray-400 mb-4">
              {error || "You need to be logged in to access the profile page."}
            </p>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </div>
        </main>
        <Footer />
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
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-5">
                {userData.email}
              </p>
              <Link href="/setting">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>

            {/* User's Posts */}
            <div className="mt-8">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-5 text-center">
                Your Posts
              </h2>
              {userPosts.length > 0 ? (
                <>
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

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}>
                        Previous
                      </Button>

                      <div className="text-sm">
                        Page {currentPage + 1} of {totalPages}
                        <span className="text-gray-500 ml-2">
                          ({totalItems} posts)
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-5">
                    You haven't created any posts yet.
                  </p>
                  <Link href="/blog">
                    <Button>Create Your First Post</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
