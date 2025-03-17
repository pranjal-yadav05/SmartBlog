"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { FeaturedPosts } from "@/components/featured-posts";
import { useState, useEffect } from "react";
import Footer from "@/components/footer";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true when component mounts in browser
    setIsMounted(true);

    // Check localStorage for JWT
    const token = localStorage.getItem("jwt");
    setIsLoggedIn(!!token);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Welcome to <span className="mx-2 logo">SmartBlog</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Your source for insightful articles, tutorials, and the latest
                  trends in technology.
                </p>
              </div>
              <div className="space-x-4">
                {!isLoggedIn ? (
                  <Link href="/login">
                    <Button>Get Started</Button>
                  </Link>
                ) : (
                  <Link href="/profile">
                    <Button variant="outline">Go to Profile</Button>
                  </Link>
                )}

                <Link href="/blog">
                  <Button variant="outline">Explore Blog</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FeaturedPosts />

        {/* Conditionally render this section based on the login status */}
        {isLoggedIn ? (
          <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Welcome Back to SmartBlog!
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Thanks for being a part of our community! Continue reading
                    articles or manage your profile.
                  </p>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/profile">
                      <Button>Go to Profile</Button>
                    </Link>
                    <Link href="/blog">
                      <Button variant="outline">Explore New Articles</Button>
                    </Link>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Continue Your Journey</CardTitle>
                    <CardDescription>
                      Benefits of being a member
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Personalized content recommendations</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Save and organize your favorite articles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Comment and engage with the community</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Get notified about new content</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        ) : (
          <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Join Our Community
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create an account to get personalized content
                    recommendations, save your favorite articles, and engage
                    with other readers.
                  </p>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/login">
                      <Button>Sign Up Now</Button>
                    </Link>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Why Join SmartBlog?</CardTitle>
                    <CardDescription>
                      Benefits of creating an account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Personalized content recommendations</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Save and organize your favorite articles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Comment and engage with the community</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p>Get notified about new content</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/login" className="w-full">
                      <Button className="w-full">Create Account</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
