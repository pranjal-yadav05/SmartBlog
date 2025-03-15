'use client';

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">About <span className="mx-7 logo">SmartBlog</span></h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                SmartBlog is a modern platform designed for passionate writers and readers. We bring you insightful articles, 
                engaging discussions, and the latest trends in technology, lifestyle, and more.
              </p>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Mission</h2>
              <p className="text-gray-500 dark:text-gray-400">
                At SmartBlog, we aim to create a dynamic space where writers can express their thoughts, share knowledge, and 
                connect with a community of like-minded individuals. We believe in the power of words and the impact of ideas.
              </p>
              <Link href="/blog">
                <Button>Explore Our Blog</Button>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>What We Offer</CardTitle>
                <CardDescription>Why SmartBlog is the right place for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p>High-quality, insightful articles</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p>Engaging discussions and community interactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p>Personalized content recommendations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t bg-gray-100 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="container px-4 md:px-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} SmartBlog. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Terms</Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Privacy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
