"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import BlogCard from "@/components/blog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen";

export default function BlogPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [postToUpdate, setPostToUpdate] = useState(null);
  const { addToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Form state for creating a new post
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Web Development",
    authorEmail: "",
    image: null,
  });

  const [submitting, setSubmitting] = useState(false);

  // Available categories for the dropdown
  const availableCategories = [
    "React",
    "JavaScript",
    "CSS",
    "Accessibility",
    "Performance",
    "Web Development",
  ];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Add the following to the top of the component, with the other state variables
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Set mounted to true when component mounts in browser
    setIsMounted(true);

    // Check localStorage for JWT
    const token = localStorage.getItem("jwt");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const decodeJWT = (token) => {
        try {
          const payload = JSON.parse(atob(token.split(".")[1])); // Decode base64 payload
          return { name: payload.name, email: payload.email }; // Return 'name' and 'email'
        } catch (error) {
          console.error("Failed to decode JWT", error);
          return null;
        }
      };

      const token = localStorage.getItem("jwt");
      const email = decodeJWT(token);
      setLoggedInEmail(email.email);
      setNewPost((prev) => ({ ...prev, authorEmail: email.email }));
    }
  }, [isLoggedIn]);

  const fetchBlogData = async () => {
    try {
      let data;

      // If category is selected, use the category-specific paginated endpoint
      if (selectedCategory !== "All") {
        const categoryResponse = await fetch(
          `${API_URL}/api/posts/category/${selectedCategory}?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch category posts");
        }

        data = await categoryResponse.json();
      } else {
        // Fetch paginated posts from the API (all posts)
        const response = await fetch(
          `${API_URL}/api/posts/paginated?page=${currentPage}&size=${pageSize}&sortBy=createdAt&direction=desc`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        data = await response.json();
      }

      // Process the data to match our frontend needs
      const processedPosts = data.content.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: getExcerpt(post.content),
        date: formatDate(post.createdAt),
        author: {
          name: post.author?.name || "Anonymous", // ✅ Keep name
          email: post.author?.email || "", // ✅ Add email
        }, // ✅ Fix: Access `name` instead of whole object
        category: post.category,
        imageUrl: post.imageUrl,
        readTime: getReadTime(post.content),
      }));

      setBlogPosts(processedPosts);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);

      // Fetch all posts just for categories - could be optimized in future
      const allPostsResponse = await fetch(`${API_URL}/api/posts/`);
      if (allPostsResponse.ok) {
        const allPosts = await allPostsResponse.json();
        // Extract categories from posts and count occurrences
        const categoryMap = {};
        allPosts.forEach((post) => {
          if (categoryMap[post.category]) {
            categoryMap[post.category]++;
          } else {
            categoryMap[post.category] = 1;
          }
        });

        const extractedCategories = Object.keys(categoryMap).map((name) => ({
          name,
          count: categoryMap[name],
        }));

        setCategories(extractedCategories);

        // Set recent posts (top 4 most recent)
        const sortedPosts = allPosts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
          .map((post) => ({
            id: post.id,
            title: post.title,
            date: formatDate(post.createdAt),
          }));

        setRecentPosts(sortedPosts);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching blog data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, [currentPage, selectedCategory]); // Refetch when page or category changes

  // Function to handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // Scroll to top on page change
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setBlogPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );
      addToast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      addToast({ title: "Error", description: "Could not delete post." });
    }
  };

  // Handle update post - fetch full post data and open dialog
  const handleUpdateClick = async (post) => {
    const token = localStorage.getItem("jwt");
    try {
      // Fetch the full post data
      const response = await fetch(`${API_URL}/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch post");

      const fullPost = await response.json();

      // Set the post to update and populate the form
      setPostToUpdate(fullPost);
      setNewPost({
        title: fullPost.title || "",
        content: fullPost.content || "",
        category: fullPost.category || "Web Development",
        authorEmail: fullPost.author?.email || loggedInEmail,
        image: null, // Don't pre-populate image, user can upload new one
      });

      // Check if category is custom
      setIsCustomCategory(!availableCategories.includes(fullPost.category));

      setIsUpdateMode(true);
      setCreateDialogOpen(true);
    } catch (err) {
      console.error("Error fetching post for update:", err);
      addToast({
        title: "Error",
        description: "Could not load post for editing.",
      });
    }
  };

  // Update post handler
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !postToUpdate) {
      addToast({
        title: "Error",
        description: "Cannot update post.",
      });
      return;
    }
    setSubmitting(true);

    try {
      const token = localStorage.getItem("jwt");

      let response;

      // If a new image is selected, use FormData (matches backend multipart endpoint)
      if (newPost.image) {
        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("content", newPost.content);
        formData.append("category", newPost.category);
        formData.append("imageFile", newPost.image); // Backend expects "imageFile"

        response = await fetch(`${API_URL}/api/posts/${postToUpdate.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header - browser will set it with boundary for FormData
          },
          body: formData,
        });
      } else {
        // If no image, send JSON (matching backend @RequestBody annotation)
        const updatedPostData = {
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
        };

        response = await fetch(`${API_URL}/api/posts/${postToUpdate.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPostData),
        });
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to update post" }));
        throw new Error(errorData.message || "Failed to update post");
      }

      const updatedPost = await response.json();

      // Refresh the blog data
      fetchBlogData();

      // Reset form and close dialog
      setNewPost({
        title: "",
        content: "",
        category: "Web Development",
        authorEmail: "",
        image: null,
      });
      setIsCustomCategory(false);
      setIsUpdateMode(false);
      setPostToUpdate(null);
      setCreateDialogOpen(false);

      addToast({
        title: "Post updated",
        description: "Your post has been updated successfully!",
      });
    } catch (err) {
      console.error("Error updating post:", err);
      addToast({
        title: "Error",
        description: err.message || "Could not update post.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Create post handler
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      addToast({
        title: "Login Required",
        description: "You must be logged in to create a post.",
      });
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("category", newPost.category);
      formData.append("authorEmail", newPost.authorEmail);

      if (newPost.image) {
        formData.append("image", newPost.image); // ✅ Attach image file
      }

      const response = await fetch(`${API_URL}/api/posts/create`, {
        method: "POST",
        body: formData, // ✅ Send as FormData
      });

      if (!response.ok) throw new Error("Failed to create post");

      const createdPost = await response.json();
      fetchBlogData();
      setNewPost({
        title: "",
        content: "",
        category: "Web Development",
        authorEmail: "",
        image: null,
      });
      setIsCustomCategory(false);
      setCreateDialogOpen(false);
      addToast({
        title: "Post created",
        description: "Your post has been published!",
      });
    } catch (err) {
      console.error("Error creating post:", err);
      addToast({ title: "Error", description: "Could not publish post." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!newPost.title.trim()) {
      alert("Please enter a title for AI generation.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch(`${API_URL}/api/posts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: newPost.title,
          authorEmail: newPost.authorEmail,
        }),
      });

      // ✅ Parse response safely
      const generatedPost = await response.json();

      // ✅ Check if API responded with an error
      if (!response.ok) {
        console.error("Error generating post:", generatedPost);
        alert("Failed to generate post. Try again.");
        return;
      }

      // ✅ Only update state if AI returned content
      if (generatedPost.content) {
        setNewPost((prev) => ({
          ...prev,
          content: generatedPost.content,
        }));

        addToast({
          title: "AI-generated content added!",
          description: "Your post has been generated.",
        });
      } else {
        alert("AI failed to generate meaningful content.");
      }
    } catch (err) {
      console.error("Unexpected error generating post:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      setNewPost((prev) => ({
        ...prev,
        image: e.target.files[0], // ✅ Store the file object
      }));
    } else {
      setNewPost((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = (value) => {
    if (value === "custom") {
      setIsCustomCategory(true);
      // Don't reset the category here
    } else {
      setIsCustomCategory(false);
      setNewPost((prev) => ({
        ...prev,
        category: value,
      }));
    }
  };

  // Helper functions
  // Function to remove markdown formatting from content
  const stripMarkdown = (text) => {
    if (!text) return "";

    // Remove markdown headers (# ## ### etc.)
    text = text.replace(/^#{1,6}\s+/gm, "");

    // Remove markdown bold/italic (**text**, *text*, __text__, _text_)
    text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
    text = text.replace(/\*([^*]+)\*/g, "$1");
    text = text.replace(/__([^_]+)__/g, "$1");
    text = text.replace(/_([^_]+)_/g, "$1");

    // Remove markdown links [text](url)
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // Remove markdown code blocks ```code``` and `code`
    text = text.replace(/```[\s\S]*?```/g, "");
    text = text.replace(/`([^`]+)`/g, "$1");

    // Remove markdown lists (-, *, +, 1.)
    text = text.replace(/^[\s]*[-*+]\s+/gm, "");
    text = text.replace(/^[\s]*\d+\.\s+/gm, "");

    // Remove markdown blockquotes (>)
    text = text.replace(/^>\s+/gm, "");

    // Clean up extra whitespace and newlines
    text = text.replace(/\n+/g, " ");
    text = text.replace(/\s+/g, " ");

    return text.trim();
  };

  const getExcerpt = (content, maxLength = 120) => {
    if (!content) return "No content available";

    // First strip markdown formatting
    const cleanContent = stripMarkdown(content);

    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength).trim() + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadTime = (content) => {
    if (!content) return "1 min read";
    // Average reading speed is ~200-250 words per minute
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Update the category selection handler to reset pagination
  const handleCategorySelect = (category) => {
    setCurrentPage(0); // Reset to first page when changing category
    setSelectedCategory(category);
  };

  // Filter posts client-side based on search query only (category filtering is server-side now)
  const getFilteredPosts = () => {
    if (!searchQuery) return blogPosts; // No client-side filtering needed

    return blogPosts.filter((post) => {
      return post.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const filteredPosts = getFilteredPosts();

  // Add this function with the other handler functions
  const handleSubscribe = async () => {
    if (!subscribeEmail || !subscribeEmail.includes("@")) {
      addToast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setSubscribing(true);

    try {
      const response = await fetch(
        `${API_URL}/api/newsletter/subscribe?email=${encodeURIComponent(
          subscribeEmail
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        addToast({
          title: "Subscription Successful",
          description: "You've been subscribed to our weekly newsletter!",
        });
        setSubscribeEmail(""); // Clear the input
      } else {
        // Handle already subscribed case
        if (response.status === 409) {
          addToast({
            title: "Already Subscribed",
            description:
              data.message ||
              "This email is already subscribed to our newsletter.",
          });
        } else {
          throw new Error(data.message || "Failed to subscribe");
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      addToast({
        title: "Subscription Error",
        description:
          "There was an error subscribing to the newsletter. Please try again.",
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingScreen message="Loading blogs... Please wait a moment." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-6 md:py-10">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 text-center">
            <p className="text-red-500">Error loading blog content: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6 md:py-10">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Main content */}
            <div className="flex-1">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
                  {isLoggedIn ? (
                    <Button
                      onClick={() => {
                        setIsUpdateMode(false);
                        setPostToUpdate(null);
                        setNewPost({
                          title: "",
                          content: "",
                          category: "Web Development",
                          authorEmail: loggedInEmail || "",
                          image: null,
                        });
                        setIsCustomCategory(false);
                        setCreateDialogOpen(true);
                      }}>
                      <Plus className="mr-2 h-4 w-4" /> New Post
                    </Button>
                  ) : (
                    <>Login to Create Post</>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Explore the latest articles, tutorials, and insights on web
                  development, design, and technology.
                </p>
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    className="hover:bg-primary/10 cursor-pointer"
                    onClick={() => handleCategorySelect("All")}>
                    All
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category.name}
                      variant={
                        selectedCategory === category.name
                          ? "default"
                          : "outline"
                      }
                      className="hover:bg-primary/10 cursor-pointer"
                      onClick={() => handleCategorySelect(category.name)}>
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {filteredPosts.map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      loggedInEmail={loggedInEmail}
                      onDelete={handleDeletePost}
                      onUpdate={handleUpdateClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No posts found matching your criteria.
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {!searchQuery && (
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

              {/* If searching, show "Clear Filters" button */}
              {searchQuery && filteredPosts.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                    }}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <div key={index}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategorySelect(category.name);
                          }}
                          className="flex justify-between items-center py-1 hover:text-primary">
                          <span>{category.name}</span>
                          <Badge variant="secondary">{category.count}</Badge>
                        </Link>
                        {index < categories.length - 1 && (
                          <Separator className="my-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentPosts.map((post, index) => (
                      <div key={post.id}>
                        <Link
                          href={`/blog/${post.id}`}
                          className="block py-1 hover:text-primary">
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-500">{post.date}</p>
                        </Link>
                        {index < recentPosts.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscribe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Get the top 5 posts of the week delivered right to your
                    inbox.
                  </p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Your email address"
                      type="email"
                      id="subscribe-email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={handleSubscribe}
                      disabled={subscribing}>
                      {subscribing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create/Update Post Dialog */}
          <Dialog
            open={createDialogOpen}
            onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) {
                // Reset form when dialog closes
                setIsUpdateMode(false);
                setPostToUpdate(null);
                setNewPost({
                  title: "",
                  content: "",
                  category: "Web Development",
                  authorEmail: "",
                  image: null,
                });
                setIsCustomCategory(false);
              }
            }}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isUpdateMode ? "Update Blog Post" : "Create New Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={isUpdateMode ? handleUpdatePost : handleCreatePost}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter post title"
                      value={newPost.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="author">Author Email</Label>
                    <Input
                      id="author"
                      name="author"
                      placeholder="Your email"
                      readOnly
                      value={newPost.authorEmail}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>

                    {/* Dropdown for categories */}
                    <Select
                      value={isCustomCategory ? "custom" : newPost.category} // Ensure correct value handling
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setIsCustomCategory(true); // Show input field
                          setNewPost((prev) => ({ ...prev, category: "" })); // Reset category
                        } else {
                          setIsCustomCategory(false);
                          setNewPost((prev) => ({ ...prev, category: value }));
                        }
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Write Your Own</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Input field for custom category */}
                    {isCustomCategory && (
                      <Input
                        type="text"
                        placeholder="Enter your category"
                        value={newPost.category}
                        onChange={(e) =>
                          setNewPost((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image">
                      {isUpdateMode
                        ? "Update Image (optional)"
                        : "Upload Image"}
                    </Label>
                    {isUpdateMode && postToUpdate?.imageUrl && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500 mb-2">
                          Current image:
                        </p>
                        <img
                          src={postToUpdate.imageUrl}
                          alt="Current post image"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Upload a new image to replace the current one
                        </p>
                      </div>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
                    {newPost.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">
                          New image preview:
                        </p>
                        <img
                          src={URL.createObjectURL(newPost.image)}
                          alt="New post image preview"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>

                  {/* ✅ Textarea with scrollability */}
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your blog post here or use AI to generate..."
                      className="h-[200px] max-h-[300px] overflow-y-auto"
                      value={newPost.content}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePost}
                    disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate with AI"
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUpdateMode ? "Updating..." : "Publishing..."}
                      </>
                    ) : isUpdateMode ? (
                      "Update Post"
                    ) : (
                      "Publish Post"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}
