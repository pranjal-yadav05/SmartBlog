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
import { Loader2 } from "lucide-react";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen";
import { useParams } from "next/navigation";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6; // Smaller page size for profile view
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const params = useParams();
  const userEmail = decodeURIComponent(params.email);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    // Get current logged in user's email
    const email = localStorage.getItem("email");
    setCurrentUserEmail(email);

    // Log the viewed user data from localStorage, if available
    const viewedUserEmail = localStorage.getItem("viewedUserEmail");
    // Fetch user profile by email
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {

      // Try to get cached user data first
      const cachedUserData = localStorage.getItem("viewedUserData");
      if (cachedUserData) {
        try {
          const parsedUser = JSON.parse(cachedUserData);
          if (
            parsedUser.email &&
            parsedUser.email.toLowerCase() === userEmail.toLowerCase()
          ) {
            setUserData({
              name: parsedUser.name || "Unknown User",
              email: parsedUser.email,
              profilePicture:
                parsedUser.profileImageUrl || parsedUser.profileImage || null,
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached user data:", e);
        }
      }

      // Get users list and filter by the email if no cached data
      const response = await fetch(
        `${API_URL}/api/users?search=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        console.error("API response not OK:", response.status);
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();

      let user = null;

      // First try to find by exact email match
      if (Array.isArray(users)) {
        user = users.find(
          (u) => u.email && u.email.toLowerCase() === userEmail.toLowerCase()
        );

        // If not found, try to find by partial match
        if (!user && users.length > 0) {
          user = users[0]; // Use the first result as fallback
        }
      }

      // If still no user found from API, try to use localStorage data
      if (!user) {
        const viewedUserEmail = localStorage.getItem("viewedUserEmail");
        const viewedUserName = localStorage.getItem("viewedUserName");
        const viewedUserProfileImage = localStorage.getItem(
          "viewedUserProfileImage"
        );

        if (
          viewedUserEmail &&
          viewedUserEmail.toLowerCase() === userEmail.toLowerCase()
        ) {
          user = {
            name: viewedUserName || "Unknown User",
            email: viewedUserEmail,
            profileImage: viewedUserProfileImage || null,
          };
        }
      }

      if (!user) {
        console.error("User not found in API response or localStorage");
        setError("User not found. Please check the email address.");
        setIsLoading(false);
        return;
      }


      setUserData({
        name: user.name || "Unknown User",
        email: user.email,
        profilePicture:
          user.profileImage && user.profileImage !== "null"
            ? user.profileImage
            : null,
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user profile:", err);

      // Try to recover using localStorage - first try JSON data
      try {
        const cachedUserData = localStorage.getItem("viewedUserData");
        if (cachedUserData) {
          const parsedUser = JSON.parse(cachedUserData);
          if (
            parsedUser.email &&
            parsedUser.email.toLowerCase() === userEmail.toLowerCase()
          ) {
            setUserData({
              name: parsedUser.name || "Unknown User",
              email: parsedUser.email,
              profilePicture:
                parsedUser.profileImageUrl || parsedUser.profileImage || null,
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (jsonError) {
        console.error("Error parsing cached JSON user data:", jsonError);
      }

      // Fall back to individual localStorage fields
      const viewedUserEmail = localStorage.getItem("viewedUserEmail");
      const viewedUserName = localStorage.getItem("viewedUserName");
      const viewedUserProfileImage = localStorage.getItem(
        "viewedUserProfileImage"
      );

      if (
        viewedUserEmail &&
        viewedUserEmail.toLowerCase() === userEmail.toLowerCase()
      ) {
        setUserData({
          name: viewedUserName || "Unknown User",
          email: viewedUserEmail,
          profilePicture: viewedUserProfileImage || null,
        });
        setIsLoading(false);
        return;
      }

      setError("Error fetching user profile. Please try again later.");
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (email) => {
    try {
      setIsPostsLoading(true);

      // Use the paginated endpoint
      const response = await fetch(
        `${API_URL}/api/posts/user/${encodeURIComponent(
          email
        )}/paginated?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`
      );

      if (!response.ok) {
        console.error("Error fetching user posts, status:", response.status);
        throw new Error(`Failed to fetch user posts: ${response.status}`);
      }

      const data = await response.json();

      // Handle both array and paginated response formats
      if (data.content && Array.isArray(data.content)) {
        setUserPosts(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || data.content.length);
        setCurrentPage(data.currentPage || 0);
      } else if (Array.isArray(data)) {
        setUserPosts(data);
        setTotalPages(1);
        setTotalItems(data.length);
        setCurrentPage(0);
      } else {
        console.error("Unexpected posts data format:", data);
        setUserPosts([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      // Set empty posts but don't show an error message - the profile should still display
      setUserPosts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsPostsLoading(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Remove direct fetch call as it's handled by the useEffect
    }
  };

  // Add a separate useEffect to handle pagination
  useEffect(() => {
    if (userData && userData.email) {
      fetchUserPosts(userData.email);
    }
  }, [currentPage, userData]);

  // Helper function to get profile image for specific users or validate URLs
  const getProfileImageForUser = (user) => {
    // For other users, validate their profile image URL
    if (
      !user.profilePicture ||
      user.profilePicture === "null" ||
      user.profilePicture === "undefined"
    ) {
      return null;
    }

    // Check if the URL is already absolute (starts with http or https)
    if (
      user.profilePicture.startsWith("http://") ||
      user.profilePicture.startsWith("https://")
    ) {
      return user.profilePicture;
    }

    // Check if it's a local path that should start with a slash
    if (!user.profilePicture.startsWith("/")) {
      return `/${user.profilePicture}`;
    }

    return user.profilePicture;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingScreen message="Loading profile... Fetching user details." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
              User Not Found
            </h2>
            <p className="text-gray-500 md:text-xl dark:text-gray-400 mb-4">
              {error}
            </p>
            <Link href="/blog">
              <Button>Go to Blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCurrentUser = currentUserEmail === userData.email;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1">
        <section className="flex flex-1 flex-col w-full bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
            <div className="flex flex-col items-center text-center">
              {(() => {
                const profileImage = getProfileImageForUser(userData);

                if (profileImage) {
                  return (
                    <img
                      src={profileImage}
                      alt={userData.name}
                      className="w-32 h-32 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  );
                } else {
                  return (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl font-semibold">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  );
                }
              })()}
              <h1 className="text-4xl font-semibold mt-4">{userData.name}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-5">
                {userData.email}
              </p>

              {isCurrentUser && (
                <Link href="/setting">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              )}
            </div>

            {/* User's Posts */}
            <div className="mt-8">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-5 text-center">
                {isCurrentUser ? "Your Posts" : `${userData.name}'s Posts`}
              </h2>
              {isPostsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">
                    Loading {isCurrentUser ? "your" : `${userData.name}'s`}{" "}
                    posts...
                  </span>
                </div>
              ) : userPosts.length > 0 ? (
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
                    {isCurrentUser
                      ? "You haven't created any posts yet."
                      : `${userData.name} hasn't created any posts yet.`}
                  </p>
                  {isCurrentUser && (
                    <Link href="/blog">
                      <Button>Create Your First Post</Button>
                    </Link>
                  )}
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
