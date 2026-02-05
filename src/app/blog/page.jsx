"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import BlogCard from "@/components/blog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, Plus, Trash2, FileText, Upload, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
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

function BlogContent() {
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
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiError, setAiError] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [categoryPage, setCategoryPage] = useState(0);
  const [totalCategoryPages, setTotalCategoryPages] = useState(0);
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false);
  const markdownInputRef = useRef(null);
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
    image: null,
    published: true, // ✅ New field
  });

  const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
  const [isPublishSubmitting, setIsPublishSubmitting] = useState(false);
  const [isDraftEditMode, setIsDraftEditMode] = useState(false);
  const [draftIdToUpdate, setDraftIdToUpdate] = useState(null);
  const [draftToUpdate, setDraftToUpdate] = useState(null);
  const [userDrafts, setUserDrafts] = useState([]);
  const [isDraftsManagerOpen, setIsDraftsManagerOpen] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState(null);
  const [publishingDraftId, setPublishingDraftId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

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
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);
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
    }
  }, [isLoggedIn]);

  const searchParams = useSearchParams();
  
  useEffect(() => {
    const draftId = searchParams.get("editDraft");
    if (draftId && isLoggedIn) {
      const fetchAndEdit = async () => {
        try {
          const response = await fetch(`${API_URL}/api/posts/drafts/${draftId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` }
          });
          if (response.ok) {
            const draft = await response.json();
            handleEditDraft(draft);
          } else {
            console.error("Failed to fetch draft:", response.status);
            addToast({
              title: "Load Failed",
              description: "Could not find the requested draft.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error("Error auto-loading draft:", err);
          addToast({
            title: "Error",
            description: "An error occurred while loading your draft.",
            variant: "destructive",
          });
        }
      };
      fetchAndEdit();
    }
  }, [searchParams, isLoggedIn]);

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
        views: post.views,
        claps: post.claps,
        readTime: getReadTime(post.content),
      }));

      setBlogPosts(processedPosts);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.currentPage);

      // Fetch categories separately to handle pagination independently
      fetchCategories(0, false);

      // Fetch recent posts separately or from the current page content
      // Since current page is sorted by desc, we can use it for recent posts
      const recent = data.content.slice(0, 4).map((post) => ({
        id: post.id,
        title: post.title,
        date: formatDate(post.createdAt),
      }));
      setRecentPosts(recent);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching blog data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCategories = async (page = 0, append = false) => {
    try {
      if (append) setLoadingMoreCategories(true);
      
      const countsResponse = await fetch(
        `${API_URL}/api/posts/categories/counts?page=${page}&size=10${
          categorySearchQuery ? `&search=${encodeURIComponent(categorySearchQuery)}` : ""
        }`
      );
      
      if (countsResponse.ok) {
        const data = await countsResponse.json();
        if (append) {
          setCategories((prev) => [...prev, ...data.categories]);
        } else {
          setCategories(data.categories);
        }
        setCategoryPage(data.currentPage);
        setTotalCategoryPages(data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      if (append) setLoadingMoreCategories(false);
    }
  };

  const fetchUserDrafts = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/drafts/user/${email}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserDrafts(data);
      }
    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      setDeletingDraftId(draftId);
      const response = await fetch(`${API_URL}/api/posts/drafts/${draftId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      if (response.ok) {
        addToast({ title: "Success", description: "Draft deleted!", variant: "success" });
        fetchUserDrafts(localStorage.getItem("email")); // Refresh the list with email
      } else {
        throw new Error("Failed to delete draft");
      }
    } catch (err) {
      addToast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingDraftId(null);
    }
  };

  useEffect(() => {
    fetchBlogData();
    if (isLoggedIn) {
      const email = localStorage.getItem("email");
      if (email) fetchUserDrafts(email);
    }
  }, [currentPage, selectedCategory, isLoggedIn]); // Removed categorySearchQuery from here to avoid double fetch

  useEffect(() => {
    fetchCategories(0, false);
  }, [categorySearchQuery]);

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
      setDeletingPostId(postId);
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
    } finally {
      setDeletingPostId(null);
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
  const handleUpdatePost = async (e, publishedStatus = true) => {
    if (e) e.preventDefault();
    if (!isLoggedIn || !postToUpdate) {
      addToast({
        title: "Error",
        description: "Cannot update post.",
      });
      return;
    }
    if (publishedStatus) setIsPublishSubmitting(true);
    else setIsDraftSubmitting(true);

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
        formData.append("published", publishedStatus);

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
          published: publishedStatus,
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
        image: null,
      });
      setIsCustomCategory(false);
      setIsUpdateMode(false);
      setPostToUpdate(null);
      setIsDraftEditMode(false);
      setDraftIdToUpdate(null);
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
      setIsDraftSubmitting(false);
      setIsPublishSubmitting(false);
    }
  };

  const handleEditDraft = (draft) => {
    setNewPost({
      title: draft.title || "",
      content: draft.content || "",
      category: draft.category || "Web Development",
      image: null,
      published: false,
    });
    setIsDraftEditMode(true);
    setDraftIdToUpdate(draft.id);
    setDraftToUpdate(draft);
    setIsUpdateMode(false);
    setCreateDialogOpen(true);
    setIsDraftsManagerOpen(false);
  };

  // Create post handler
  const handleCreatePost = async (e, publishedStatus = true, manualDraftId = null) => {
    if (e) e.preventDefault();
    if (!isLoggedIn) {
      addToast({
        title: "Login Required",
        description: "You must be logged in to create a post.",
      });
      return;
    }
    if (publishedStatus) setIsPublishSubmitting(true);
    else setIsDraftSubmitting(true);

    const activeDraftId = manualDraftId || draftIdToUpdate;
    const isEditingDraft = manualDraftId ? true : isDraftEditMode;

    try {
      const token = localStorage.getItem("jwt");
      let response;

      if (isEditingDraft && !publishedStatus) {
        // Simple update of existing draft
        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("content", newPost.content);
        formData.append("category", newPost.category);
        if (newPost.image) {
          formData.append("image", newPost.image);
        }

        response = await fetch(`${API_URL}/api/posts/drafts/${activeDraftId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else if (isEditingDraft && publishedStatus) {
        // Publish existing draft
        response = await fetch(`${API_URL}/api/posts/drafts/${activeDraftId}/publish`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Normal creation (either new draft or new post)
        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("content", newPost.content);
        formData.append("category", newPost.category);
        formData.append("published", publishedStatus);

        if (newPost.image) {
          formData.append("image", newPost.image);
        }

        response = await fetch(`${API_URL}/api/posts/create`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) throw new Error("Failed to process post");

      const result = await response.json();
      fetchBlogData();
      if (isLoggedIn) fetchUserDrafts(localStorage.getItem("email"));
      
      setNewPost({
        title: "",
        content: "",
        category: "Web Development",
        image: null,
      });
      setIsCustomCategory(false);
      setIsDraftEditMode(false);
      setDraftIdToUpdate(null);
      setDraftToUpdate(null);
      setCreateDialogOpen(false);
      
      addToast({
        title: publishedStatus ? "Post published" : "Draft saved",
        description: publishedStatus 
          ? "Your post has been published!" 
          : "Your draft has been saved successfully!",
      });
    } catch (err) {
      console.error("Error processing post:", err);
      addToast({ title: "Error", description: "Could not process request." });
    } finally {
      setIsDraftSubmitting(false);
      setIsPublishSubmitting(false);
    }
  };

  const handleGetAISuggestions = async () => {
    setAiError("");
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setShowAiSuggestions(true);
      setAiError("Please provide both a title and content to get helpful suggestions.");
      return;
    }

    setGenerating(true);
    setAiSuggestions("");
    setShowAiSuggestions(true);
    const token = localStorage.getItem("jwt");

    try {
      const response = await fetch(`${API_URL}/api/posts/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get suggestions");
      }

      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        addToast({
          title: "Suggestions ready!",
          description: "AI has analyzed your post.",
          variant: "success",
        });
      } else {
        setAiSuggestions("AI failed to provide suggestions.");
      }
    } catch (err) {
      console.error("Error getting suggestions:", err);
      addToast({
        title: "Error",
        description: err.message || "Failed to get suggestions. Please try again.",
        variant: "destructive",
      });
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

  const handleMarkdownImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      addToast({
        title: "Invalid File",
        description: "Please select a .md file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target.result;
      
      if (content) {
        // Normalize line endings
        content = content.replace(/\r\n/g, "\n");
        
        // Unescape common markdown characters that might be escaped by some exporters
        // This handles cases like \# Sample, \*Published\*, \[Link\], etc.
        content = content.replace(/\\([#*_\-!\[\]()>])/g, "$1");
        
        // Replace HTML entities like &nbsp; which often appear in bad exports
        content = content.replace(/&nbsp;/g, " ");
        
        // Consolidate excessive newlines (3+ -> 2) to fix doubling issues
        content = content.replace(/\n{3,}/g, "\n\n");
        
        // Optional: Remove trailing extra newlines
        content = content.trimEnd();
      }
      
      setNewPost((prev) => ({ ...prev, content }));
      addToast({
        title: "Success",
        description: "Markdown content imported and normalized!",
        variant: "success",
      });
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = "";
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
                  <div className="flex gap-2">
                    {isLoggedIn && (
                      <Button
                        variant="outline"
                        onClick={() => setIsDraftsManagerOpen(true)}>
                        My Drafts ({userDrafts.length})
                      </Button>
                    )}
                    {isLoggedIn ? (
                      <Button
                        onClick={() => {
                          setIsUpdateMode(false);
                          setIsDraftEditMode(false);
                          setDraftIdToUpdate(null);
                          setPostToUpdate(null);
                          setNewPost({
                            title: "",
                            content: "",
                            category: "Web Development",
                            image: null,
                            published: true,
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
                  {categories.slice(0, 10).map((category) => (
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
                      onDelete={handleDeletePost}
                      onUpdate={handleUpdateClick}
                      loggedInEmail={loggedInEmail}
                      isDeleting={deletingPostId === post.id}
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
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Categories</CardTitle>
                    {categories.length > 5 && (
                      <Badge variant="secondary" className="font-normal">
                        {categories.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search categories..."
                      className="h-9 pl-8 text-sm bg-gray-50/50 dark:bg-gray-900/50"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((category, index) => (
                      <div key={index}>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategorySelect(category.name);
                          }}
                          className={`flex justify-between items-center px-2 py-2 rounded-md transition-colors ${
                            selectedCategory === category.name 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}>
                          <span className="truncate mr-2">{category.name}</span>
                          <Badge variant={selectedCategory === category.name ? "default" : "secondary"} className="h-5 min-w-[20px] px-1 justify-center shrink-0">
                            {category.count}
                          </Badge>
                        </Link>
                      </div>
                    ))}
                    
                    {categories.length === 0 && (
                      <p className="text-center py-4 text-sm text-gray-500">
                        No categories found.
                      </p>
                    )}

                    {categoryPage < totalCategoryPages - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs text-primary"
                        onClick={() => fetchCategories(categoryPage + 1, true)}
                        disabled={loadingMoreCategories}
                      >
                        {loadingMoreCategories ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : null}
                        Load More Categories
                      </Button>
                    )}
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
                setDraftToUpdate(null);
                setDraftIdToUpdate(null);
                setNewPost({
                  title: "",
                  content: "",
                  category: "Web Development",
                  image: null,
                });
                setIsCustomCategory(false);
              }
            }}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isUpdateMode ? "Update Blog Post" : isDraftEditMode ? "Update Draft" : "Create New Blog Post"}
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

                  <div className="grid gap-2 relative">
                    <Label htmlFor="category">Category</Label>
                    <div className="relative">
                      <Input
                        id="category"
                        name="category"
                        placeholder="Type to search or create category..."
                        value={newPost.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewPost(prev => ({ ...prev, category: val }));
                          setShowCategorySuggestions(true);
                        }}
                        onFocus={() => setShowCategorySuggestions(true)}
                        onBlur={() => {
                          // Small delay to allow clicking suggestions
                          setTimeout(() => setShowCategorySuggestions(false), 200);
                        }}
                        autoComplete="off"
                      />
                      {showCategorySuggestions && availableCategories.concat(categories.map(c => c.name)).filter((name, index, self) => 
                        self.indexOf(name) === index && name.toLowerCase().includes(newPost.category.toLowerCase())
                      ).length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {availableCategories.concat(categories.map(c => c.name))
                            .filter((name, index, self) => self.indexOf(name) === index && name.toLowerCase().includes(newPost.category.toLowerCase()))
                            .map((cat, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                                onMouseDown={() => {
                                  setNewPost(prev => ({ ...prev, category: cat }));
                                  setShowCategorySuggestions(false);
                                }}
                              >
                                {cat}
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image">
                      {(isUpdateMode || isDraftEditMode)
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
                    {isDraftEditMode && draftToUpdate?.imageUrl && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500 mb-2">
                          Current draft image:
                        </p>
                        <img
                          src={draftToUpdate.imageUrl}
                          alt="Current draft image"
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

                  {/* ✅ Textarea with scrollability and Markdown Guide */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Content</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".md"
                          ref={markdownInputRef}
                          className="hidden"
                          onChange={handleMarkdownImport}
                        />
                        <button 
                          type="button"
                          onClick={() => markdownInputRef.current?.click()}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Upload className="h-3 w-3" /> Import Markdown
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowMarkdownGuide(!showMarkdownGuide)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {showMarkdownGuide ? "Hide Guide" : "Markdown Guide?"}
                        </button>
                      </div>
                    </div>

                    {showMarkdownGuide && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 mb-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div className="space-y-3">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Structure</p>
                              <p><span className="font-mono text-primary font-bold"># Heading 1</span> - Main Title</p>
                              <p><span className="font-mono text-primary font-bold">## Heading 2</span> - Major Section</p>
                              <p><span className="font-mono text-primary font-bold">### Heading 3</span> - Sub Section</p>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Emphasis</p>
                              <p><span className="font-mono text-primary font-bold">**Bold**</span> or <span className="font-mono text-primary font-bold">__Bold__</span></p>
                              <p><span className="font-mono text-primary font-bold">*Italic*</span> or <span className="font-mono text-primary font-bold">_Italic_</span></p>
                              <p><span className="font-mono text-primary font-bold">~~Strikethrough~~</span></p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Lists & Links</p>
                              <p><span className="font-mono text-primary font-bold">- List Item</span> (or <span className="font-mono text-primary font-bold">*</span> or <span className="font-mono text-primary font-bold">+</span>)</p>
                              <p><span className="font-mono text-primary font-bold">1. Numbered Item</span></p>
                              <p><span className="font-mono text-primary font-bold">[Link Text](URL)</span></p>
                              <p><span className="font-mono text-primary font-bold">![Alt Text](Img URL)</span></p>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Advanced</p>
                              <p><span className="font-mono text-primary font-bold">{">"} Quote</span> - For callouts</p>
                              <p><span className="font-mono text-pink-500 font-bold">`inline code`</span> - Single backticks</p>
                              <p><span className="font-mono text-pink-500 font-bold">```lang</span> - Code blocks</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t dark:border-gray-800 space-y-2">
                          <p className="italic">💡 <span className="font-bold">Pro Tip:</span> Use multiple headings to structure your content better and keep readers engaged!</p>
                          <div className="bg-primary/5 dark:bg-primary/10 p-2 rounded text-[11px] leading-relaxed border border-primary/20">
                            <p className="font-bold text-primary mb-1">Code Block Example:</p>
                            <p className="font-mono whitespace-pre">{"```java\npublic class Hello {\n  public static void main(String[] args) {\n    System.out.println(\"Hi!\");\n  }\n}\n```"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your blog post here and use AI for suggestions..."
                      className="h-[250px] max-h-[400px] overflow-y-auto"
                      value={newPost.content}
                      onChange={handleInputChange}
                      required
                    />

                    {/* AI Suggestions Display */}
                    {showAiSuggestions && (
                      <div className="mt-4 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Sparkles className="h-4 w-4" /> AI Suggestions
                          </h4>
                          <button 
                            onClick={() => setShowAiSuggestions(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {generating ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3" />
                            <p className="text-sm text-blue-600 animate-pulse">Analyzing your content...</p>
                          </div>
                        ) : aiError ? (
                          <div className="flex items-start gap-2 text-red-500 dark:text-red-400 py-2">
                             <div className="mt-0.5">•</div>
                             <p className="text-sm leading-relaxed">{aiError}</p>
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {aiSuggestions}
                            </ReactMarkdown>
                          </div>
                        )}
                        
                        <p className="mt-4 text-[10px] text-blue-500/70 italic text-right italic">
                           Suggested by SmartBlog
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex flex-wrap gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetAISuggestions}
                    className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isDraftSubmitting || isPublishSubmitting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isDraftSubmitting || isPublishSubmitting || !newPost.title || !newPost.content}
                    onClick={() =>
                      isUpdateMode
                        ? handleUpdatePost(null, false)
                        : handleCreatePost(null, false)
                    }>
                    {isDraftSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Save as Draft"
                    )}
                  </Button>
                  <Button
                    type="button"
                    disabled={isDraftSubmitting || isPublishSubmitting || !newPost.title || !newPost.content}
                    onClick={() =>
                      isUpdateMode
                        ? handleUpdatePost(null, true)
                        : handleCreatePost(null, true)
                    }>
                    {isPublishSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

          {/* Drafts Manager Dialog */}
          <Dialog open={isDraftsManagerOpen} onOpenChange={setIsDraftsManagerOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-x-hidden overflow-y-auto">
              <DialogHeader>
                <DialogTitle>My Drafts</DialogTitle>
                <DialogDescription>
                  Manage your unpublished posts here. You can edit or publish them.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 mt-4">
                {userDrafts.length > 0 ? (
                  userDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="flex w-full min-w-0 items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center flex-1 min-w-0 mr-4">
                        {draft.imageUrl && (
                          <img
                            src={draft.imageUrl}
                            alt=""
                            className="w-12 h-12 object-cover rounded mr-4 shrink-0 border"
                          />
                        )}
                        <div className="min-w-0 w-full">
                          <h4 className="font-semibold truncate">{draft.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {stripMarkdown(draft.content)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 max-w-full">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          disabled={deletingDraftId === draft.id}
                          onClick={() => handleDeleteDraft(draft.id)}>
                          {deletingDraftId === draft.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={publishingDraftId === draft.id || deletingDraftId === draft.id}
                          onClick={() => handleEditDraft(draft)}>
                          Edit
                        </Button>
                         <Button
                          size="sm"
                          disabled={publishingDraftId === draft.id || deletingDraftId === draft.id}
                          onClick={async () => {
                            try {
                              setPublishingDraftId(draft.id);
                              setDraftIdToUpdate(draft.id);
                              setIsDraftEditMode(true);
                              await handleCreatePost(null, true, draft.id);
                            } finally {
                              setPublishingDraftId(null);
                            }
                          }}>
                          {publishingDraftId === draft.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            "Publish"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    You have no drafts at the moment.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading blog..." />}>
      <BlogContent />
    </Suspense>
  );
}
