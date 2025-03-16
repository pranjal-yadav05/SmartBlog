"use client";

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";


export function FeaturedPosts() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/posts/`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        
        const data = await response.json()
        
        // Get the 3 most recent posts
        const recentPosts = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          
        setFeaturedPosts(recentPosts)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Function to extract a short excerpt from the content
  const getExcerpt = (content, maxLength = 120) => {
    if (!content) return ""
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + "..."
  }

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-center flex-wrap">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <p className="text-sm sm:text-base">Loading featured posts... This may take up to a minute.</p>
        </div>
          <div className="flex justify-center mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  Why is this slow?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Why the Delay? ⏳</DialogTitle>
                  <DialogDescription>
                    The server runs on a free-tier Render deployment, which means it goes to sleep when inactive. 
                    Waking it up can take 50-60 seconds. Once started, it runs smoothly! 🚀  
                    <br /><br />
                    This is a temporary limitation due to budget constraints.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Got it</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    );
  }
    

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-red-500">Error loading posts: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Posts</h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
              Discover our most popular and trending articles
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image 
                    src={post.imageUrl || "/placeholder.svg"} 
                    alt={post.title} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                  </div>
                  <Link href={`/blog/${post.id}`} className="hover:underline">
                    <h3 className="text-xl font-bold leading-tight mt-2">{post.title}</h3>
                  </Link>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-gray-500 line-clamp-3">{getExcerpt(post.content)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/blog/${post.id}`} className="text-sm font-medium text-primary hover:underline">
                    Read more
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
  )
}