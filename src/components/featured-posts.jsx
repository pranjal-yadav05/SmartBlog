"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "./loading-screen";

export function FeaturedPosts() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/posts/`);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();

        // Get the 3 most recent posts
        const recentPosts = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        setFeaturedPosts(recentPosts);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  // Function to extract a short excerpt from the content (with markdown stripped)
  const getExcerpt = (content, maxLength = 120) => {
    if (!content) return "";

    // First strip markdown formatting
    const cleanContent = stripMarkdown(content);

    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength).trim() + "...";
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900 flex justify-center items-center min-h-[600px]">
        <LoadingScreen message="Loading featured posts..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 text-center">
          <p className="text-red-500">Error loading posts: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Featured Posts
            </h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
              Discover our most popular and trending articles
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-none shadow-none hover:shadow-xl transition-all duration-500 p-4 pb-0 bg-transparent group">
                {/* Image Section - Lowered with intentional spacing */}
                <div className="relative w-full h-60 cursor-pointer rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Blurred Bottom Overlay for Text Visibility */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 backdrop-blur-[2px] z-10">
                    <div className="flex flex-col gap-2 transform transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/10 backdrop-blur-xl text-[10px] uppercase tracking-wider font-bold">
                          {post.category}
                        </Badge>
                        <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-lg hover:underline decoration-white/30 underline-offset-4">
                          {post.title}
                        </h3>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card Content - Subtle Excerpt */}
                <CardContent className="px-1 py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed italic">
                    "{getExcerpt(post.content)}"
                  </p>
                </CardContent>

                {/* Card Footer - Minimalist Link */}
                <CardFooter className="px-1 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800 mt-auto pt-4 flex justify-end">
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors duration-200">
                    Read Story →
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p>No posts available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
