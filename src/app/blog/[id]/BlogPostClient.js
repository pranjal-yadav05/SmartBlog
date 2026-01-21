"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import { Eye, MessageSquare, Send, Loader2 } from "lucide-react";
import LoadingScreen from "@/components/loading-screen"; // Import your loading component
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogPostClient({ post }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const viewTrackedRef = useRef(false);
  
  // Engagement State
  const [claps, setClaps] = useState(post.claps || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [user, setUser] = useState(null);
  const [clapAnimate, setClapAnimate] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    
    // Check for logged in user
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("username");
      setUser(storedUser);
    }

    // Fetch comments
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts/${post.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };

    if (post?.id) {
      fetchComments();
    }
    
    // Increment view count when page loads
    const incrementViews = async () => {
      // Prevent double call in Strict Mode or re-renders
      if (viewTrackedRef.current) return;
      viewTrackedRef.current = true;

      try {
        await fetch(`${API_URL}/api/posts/${post.id}/view`, {
          method: "POST"
        });
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };
    
    if (post?.id) {
      incrementViews();
    }
  }, [post?.id, API_URL]);

  const handleClap = async () => {
    // Optimistic update
    setClaps((prev) => prev + 1);
    setClapAnimate(true);
    setTimeout(() => setClapAnimate(false), 300); // Reset animation

    try {
      await fetch(`${API_URL}/api/posts/${post.id}/claps?amount=1`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to clap:", err);
      // Revert if failed (optional, but good UX practice)
      setClaps((prev) => prev - 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please login to comment!");
      router.push("/login");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [savedComment, ...prev]);
        setNewComment("");
      } else {
        alert("Failed to post comment.");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingScreen message="Loading your blog post..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          ← Back
        </button>

        {/* Blog Title */}
        <h1 className="text-5xl font-extrabold leading-tight text-center">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-gray-600 mt-3">
          <p>
            By{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {post.author?.name || "Anonymous"}
            </span>{" "}
            • {post.formattedDate}
          </p>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs text-pink-600 dark:text-pink-400 font-medium">
             <span className="text-sm leading-none">👏</span>
             <span>{claps} claps</span>
          </div>
        </div>

        {/* Cover Image */}
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="my-8 w-full rounded-lg shadow-md object-cover"
          />
        ) : (
          <img
            src={`/placeholder.svg?height=300&width=800&text=${encodeURIComponent(
              post.title
            )}`}
            alt={post.title}
            className="my-8 w-full rounded-lg shadow-md object-cover"
          />
        )}

        <article className="prose lg:prose-xl dark:prose-invert leading-relaxed max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-4xl font-extrabold mt-12 mb-6 border-b pb-2 dark:border-gray-800" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-3xl font-bold mt-10 mb-4 text-primary" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-2xl font-bold mt-8 mb-4" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-lg leading-8 mb-6 text-gray-700 dark:text-gray-300" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-gray-900 dark:text-white" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="pl-2" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-r-lg" {...props} />
              ),
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                
                return isInline ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400 font-mono text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <div className="my-8 rounded-xl overflow-hidden shadow-lg border dark:border-gray-800">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b dark:border-gray-800">
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">
                        {match[1] ? match[1].toUpperCase() : "CODE BLOCK"}
                      </span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                      </div>
                    </div>
                    <pre className="p-6 bg-gray-50 dark:bg-black/40 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-8 rounded-lg border dark:border-gray-800">
                  <table className="w-full border-collapse" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="bg-gray-100 dark:bg-gray-800 px-4 py-3 text-left font-bold border-b dark:border-gray-700" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-3 border-b dark:border-gray-800 text-gray-700 dark:text-gray-300" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="rounded-xl shadow-xl border dark:border-gray-800 my-10 mx-auto max-h-[500px] object-cover" {...props} />
              ),
            }}>
            {post.content}
          </ReactMarkdown>
        </article>

        <hr className="my-12 border-gray-200 dark:border-gray-800" />

        {/* Engagement Section */}
        <div className="max-w-2xl mx-auto">
           {/* Claps */}
           <div className="flex flex-col items-center justify-center gap-4 mb-16">
              <Button 
                onClick={handleClap}
                variant="outline" 
                size="lg" 
                className={`rounded-full h-16 w-16 border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 ${clapAnimate ? 'scale-110 bg-pink-50 border-pink-200 dark:bg-pink-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <span className={`text-2xl transition-transform duration-200 ${clapAnimate ? 'scale-125' : ''}`}>👏</span>
                <span className="text-xs font-bold">{claps}</span>
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enjoyed reading? Tap to clap!</p>
           </div>

           {/* Comments */}
           <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Comments ({comments.length})
              </h3>
              
              {/* Comment Input */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border dark:border-gray-800">
                {user ? (
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Share your thoughts..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none bg-white dark:bg-gray-950 min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleCommentSubmit} disabled={isSubmittingComment || !newComment.trim()}>
                        {isSubmittingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Post Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Log in to leave a comment and join the discussion.</p>
                    <Button onClick={() => router.push("/login")} variant="outline">
                      Log In / Sign Up
                    </Button>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Card key={comment.id} className="border-none shadow-none bg-transparent">
                      <CardContent className="p-0 flex gap-4">
                        <Avatar className="h-10 w-10 border">
                           <AvatarImage className="object-cover" src={comment.author?.profileImage || "/placeholder.png"} />
                           <AvatarFallback>{comment.author?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comment.author?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                            {comment.content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 italic py-8">No comments yet. Be the first to start the conversation!</p>
                )}
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
