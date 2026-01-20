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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen";
import Image from "next/image";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userDrafts, setUserDrafts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isDraftsLoading, setIsDraftsLoading] = useState(false);
  const [publishingDraftId, setPublishingDraftId] = useState(null);
  const [deletingDraftId, setDeletingDraftId] = useState(null);
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
      fetchUserDrafts(userData.email);
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
      setIsPostsLoading(true);
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
      setIsPostsLoading(false);
    }
  };

  const fetchUserDrafts = async (email) => {
    try {
      setIsDraftsLoading(true);
      const response = await fetch(`${API_URL}/api/posts/drafts/user/${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user drafts");
      }

      const data = await response.json();
      setUserDrafts(data);
    } catch (error) {
      console.error("Error fetching user drafts:", error);
    } finally {
      setIsDraftsLoading(false);
    }
  };

  const handlePublishDraft = async (draftId) => {
    if (!window.confirm("Are you sure you want to publish this draft?")) return;
    try {
      setPublishingDraftId(draftId);
      const response = await fetch(`${API_URL}/api/posts/drafts/${draftId}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to publish draft");

      // We need to use a toast if available, or alert
      alert("Draft published successfully!");
      fetchUserPosts(userData.email);
      fetchUserDrafts(userData.email);
    } catch (error) {
      console.error("Error publishing draft:", error);
      alert("Could not publish draft.");
    } finally {
      setPublishingDraftId(null);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      setDeletingDraftId(draftId);
      const response = await fetch(`${API_URL}/api/posts/drafts/${draftId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete draft");

      alert("Draft deleted successfully!");
      fetchUserDrafts(userData.email);
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Could not delete draft.");
    } finally {
      setDeletingDraftId(null);
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
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 text-center">
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
      <main className="flex flex-1">
        <section className="flex flex-1 flex-col w-full bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
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
              {/* User's Drafts Section */}
              {userDrafts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-5 text-center">
                    Your Drafts
                  </h2>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {userDrafts.map((draft) => (
                      <Card key={draft.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-sm overflow-hidden flex flex-col group relative min-h-[300px] border-none">
                        {/* Background Image */}
                        <Image
                          src={draft.imageUrl || "/placeholder.svg"}
                          alt={draft.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Heavy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 z-10" />
                        
                        {/* Content Layer */}
                        <div className="relative z-20 flex flex-col h-full text-white">
                          <CardHeader className="p-5">
                            <div className="flex justify-between items-start gap-2">
                              <CardTitle className="line-clamp-2 text-xl font-bold text-white leading-tight">
                                {draft.title}
                              </CardTitle>
                              <Badge variant="outline" className="text-orange-400 border-orange-400 bg-orange-400/10 backdrop-blur-md shrink-0">
                                Draft
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-5 pt-0 flex-1">
                            <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed">
                              {draft.content?.replace(/^#+\s*/gm, "") || "No content"}
                            </p>
                          </CardContent>
                          
                          <CardFooter className="p-5 flex gap-2">
                            <Link href={`/blog?editDraft=${draft.id}`}>
                              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md" disabled={publishingDraftId === draft.id || deletingDraftId === draft.id}>
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-md"
                              onClick={() => handlePublishDraft(draft.id)}
                              disabled={publishingDraftId === draft.id || deletingDraftId === draft.id}
                            >
                              {publishingDraftId === draft.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Publish"
                              )}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md border-none"
                              onClick={() => handleDeleteDraft(draft.id)}
                              disabled={publishingDraftId === draft.id || deletingDraftId === draft.id}
                            >
                              {deletingDraftId === draft.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </CardFooter>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-5 text-center">
                Published Posts
              </h2>
              {isPostsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">
                    Loading your posts...
                  </span>
                </div>
              ) : userPosts.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {userPosts.map((post) => (
                      <Card key={post.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-sm overflow-hidden flex flex-col group relative min-h-[300px] border-none">
                        {/* Background Image */}
                        <Image
                          src={post.imageUrl || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Heavy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 z-10" />
                        
                        {/* Content Layer */}
                        <div className="relative z-20 flex flex-col h-full text-white">
                          <CardHeader className="p-5">
                            <div className="flex justify-between items-start gap-2">
                              <CardTitle className="line-clamp-2 text-xl font-bold text-white leading-tight">
                                {post.title}
                              </CardTitle>
                              <Badge variant="secondary" className="backdrop-blur-md bg-white/20 text-white border-white/20 shrink-0">
                                {post.category}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-5 pt-0 flex-1">
                            <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed">
                              {post.content.replace(/^#+\s*/gm, "")}
                            </p>
                          </CardContent>
                          
                          <CardFooter className="p-5 mt-auto">
                            <Link href={`/blog/${post.id}`} className="w-full">
                              <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md">
                                Read More
                              </Button>
                            </Link>
                          </CardFooter>
                        </div>
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
