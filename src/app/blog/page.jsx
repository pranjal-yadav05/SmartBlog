"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import BlogCard from "@/components/blog-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen";

export default function BlogPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [blogPosts, setBlogPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { addToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Form state for creating a new post

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Web Development",
    authorEmail: '',
    image: null,
  })
  
  const [submitting, setSubmitting] = useState(false)
  
  // Available categories for the dropdown
  const availableCategories = [
    "React", 
    "JavaScript", 
    "CSS", 
    "Accessibility", 
    "Performance", 
    "Web Development"
  ]

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true when component mounts in browser
    setIsMounted(true);
    
    // Check localStorage for JWT
    const token = localStorage.getItem('jwt');
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
      setNewPost(prev => ({ ...prev, authorEmail: email.email }));
    }
  }, [isLoggedIn]);
  
  const fetchBlogData = async () => {
    try {
      // Fetch all posts from the API
      const response = await fetch(`${API_URL}/api/posts/`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      // Process the data to match our frontend needs
      const processedPosts = data.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: getExcerpt(post.content),
        date: formatDate(post.createdAt),
        author: {
          name: post.author?.name || "Anonymous", // ✅ Keep name
          email: post.author?.email || ""         // ✅ Add email
        },// ✅ Fix: Access `name` instead of whole object
        category: post.category || getCategoryFromContent(post.content),
        imageUrl: post.imageUrl,
        readTime: getReadTime(post.content),
      }));
      
      // Sort posts by date (newest first)
      const sortedPosts = processedPosts.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )
      
      setBlogPosts(sortedPosts)
      
      // Extract categories from posts and count occurrences
      const categoryMap = {}
      processedPosts.forEach(post => {
        if (categoryMap[post.category]) {
          categoryMap[post.category]++
        } else {
          categoryMap[post.category] = 1
        }
      })
      
      const extractedCategories = Object.keys(categoryMap).map(name => ({
        name,
        count: categoryMap[name]
      }))
      
      setCategories(extractedCategories)
      
      // Set recent posts (top 4 most recent)
      setRecentPosts(sortedPosts.slice(0, 4).map(post => ({
        id: post.id,
        title: post.title,
        date: post.date
      })))
      
      setLoading(false)
    } catch (err) {
      console.error("Error fetching blog data:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogData()
  }, [])

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
  
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "email": loggedInEmail, // ✅ Send user email in headers
        },
      });
  
      if (!response.ok) throw new Error("Failed to delete post");
  
      setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      addToast({ title: "Post deleted", description: "Your post has been removed." });
  
    } catch (err) {
      console.error("Error deleting post:", err);
      addToast({ title: "Error", description: "Could not delete post." });
    }
  };
  

  // Create post handler

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      addToast({ title: "Login Required", description: "You must be logged in to create a post." });
      return;
    }
    setSubmitting(true)
  
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
        method: 'POST',
        body: formData, // ✅ Send as FormData
      });
  
      if (!response.ok) throw new Error("Failed to create post");
  
      const createdPost = await response.json();
      fetchBlogData();
      setNewPost({ title: "", content: "", category: "Web Development", authorEmail: '', image: null });
      setCreateDialogOpen(false);
      addToast({ title: "Post created", description: "Your post has been published!" });
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: newPost.title, 
        authorEmail: newPost.authorEmail 
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
      setNewPost(prev => ({
        ...prev,
        content: generatedPost.content,
      }));

      addToast({ title: "AI-generated content added!", description: "Your post has been generated." });
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
      setNewPost(prev => ({
        ...prev,
        image: e.target.files[0] // ✅ Store the file object
      }));
    } else {
      setNewPost(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  
  const handleCategoryChange = (value) => {
    if (value === "custom") {
      setIsCustomCategory(true);
      // Don't reset the category here
    } else {
      setIsCustomCategory(false);
      setNewPost(prev => ({
        ...prev,
        category: value
      }));
    }
  };
  

  // Helper functions
  const getExcerpt = (content, maxLength = 120) => {
    if (!content) return "No content available"
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + "..."
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryFromContent = (content) => {
    if (!content) return "General"
    const contentLower = content.toLowerCase()
    
    if (contentLower.includes("react")) return "React"
    if (contentLower.includes("javascript") || contentLower.includes("js")) return "JavaScript"
    if (contentLower.includes("css") || contentLower.includes("tailwind")) return "CSS"
    if (contentLower.includes("accessibility") || contentLower.includes("a11y")) return "Accessibility"
    if (contentLower.includes("performance")) return "Performance"
    
    return "Web Development"
  }

  const getReadTime = (content) => {
    if (!content) return "1 min read"
    // Average reading speed is ~200-250 words per minute
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  // Filter posts based on search query and selected category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingScreen message="Loading blogs... Please wait a moment." />
        </main>
        <Footer />
      </div>
    )
  }
  
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-6 md:py-10">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-red-500">Error loading blog content: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6 md:py-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Main content */}
            <div className="flex-1">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
                  {isLoggedIn ? <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Post
                  </Button> : <>Login to Create Post</>}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Explore the latest articles, tutorials, and insights on web development, design, and technology.
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
                    onClick={() => setSelectedCategory("All")}
                  >
                    All
                  </Badge>
                  {categories.map((category) => (
                    <Badge 
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "outline"} 
                      className="hover:bg-primary/10 cursor-pointer"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} loggedInEmail={loggedInEmail} onDelete={handleDeletePost}/>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts found matching your criteria.</p>
                </div>
              )}

              {filteredPosts.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Load More</Button>
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
                            e.preventDefault()
                            setSelectedCategory(category.name)
                          }}
                          className="flex justify-between items-center py-1 hover:text-primary"
                        >
                          <span>{category.name}</span>
                          <Badge variant="secondary">{category.count}</Badge>
                        </Link>
                        {index < categories.length - 1 && <Separator className="my-1" />}
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
                        <Link href={`/blog/${post.id}`} className="block py-1 hover:text-primary">
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-500">{post.date}</p>
                        </Link>
                        {index < recentPosts.length - 1 && <Separator className="my-2" />}
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
                  <p className="text-sm text-gray-500 mb-4">Get the latest posts delivered right to your inbox.</p>
                  <div className="space-y-2">
                    <Input placeholder="Your email address" type="email" />
                    <Button className="w-full">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Create Post Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost}>
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
                      }}
                    >
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
                          setNewPost(prev => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>


                  <div className="grid gap-2">
                    <Label htmlFor="image">Upload Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
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
                  <Button type="button" variant="outline" onClick={handleGeneratePost} disabled={generating}>
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
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
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
      <Footer/>
    </div>
  )
}