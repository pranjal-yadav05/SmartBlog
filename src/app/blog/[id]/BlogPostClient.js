"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen"; // Import your loading component

export default function BlogPostClient({ post }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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

        {/* Author & Date */}
        <p className="text-gray-600 text-center mt-3">
          By{" "}
          <span className="font-medium">
            {post.author?.name || "Anonymous"}
          </span>{" "}
          • {post.formattedDate}
        </p>

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
      </main>
      <Footer />
    </div>
  );
}
