'use client';

import Footer from "@/components/footer";
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
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                About <span className="mx-7 logo">SmartBlog</span>
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                SmartBlog is a modern platform designed for passionate writers and readers. We bring you insightful articles, 
                engaging discussions, and the latest trends in technology, lifestyle, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Meet the Creator Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet the Creator</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Hi, I'm <span className="font-medium text-primary">Pranjal Yadav</span>, the developer and creator of SmartBlog. 
                As a passionate software developer and tech enthusiast, I built this platform to empower writers, spark insightful discussions, 
                and bring high-quality content to readers around the world.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                My goal with SmartBlog is to combine the power of AI with modern web technologies to enhance the blogging experience. 
                Whether you're a writer looking for a creative space or a reader exploring new ideas, SmartBlog is designed with you in mind.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>My Vision for SmartBlog</CardTitle>
                <CardDescription>Building the future of content creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p>Empowering writers with AI-driven content suggestions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p>Creating a user-friendly, distraction-free writing experience</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p>Building a vibrant and interactive community</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      
      <Footer/>
    </div>
  );
}
