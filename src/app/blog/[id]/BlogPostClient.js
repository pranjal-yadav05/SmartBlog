"use client";

import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Header } from "@/components/header";
import Footer from "@/components/footer";

export default function BlogPostClient({ post }) {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Back
        </button>

        <h1 className="text-5xl font-extrabold leading-tight text-center">
          {post.title}
        </h1>
        <p className="text-gray-600 text-center mt-3">
          By <span className="font-medium">{post.author?.name || "Anonymous"}</span> •{" "}
          {post.formattedDate}  {/* ✅ Now using pre-formatted date */}
        </p>

        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="my-8 w-full rounded-lg shadow-md object-cover"
          />
        ) : (
          <img
            src={`/placeholder.svg?height=300&width=800&text=${encodeURIComponent(post.title)}`}
            alt={post.title}
            className="my-8 w-full rounded-lg shadow-md object-cover"
          />
        )}

        <article className="prose lg:prose-xl dark:prose-invert leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </div>
      <Footer />
    </>
  );
}
