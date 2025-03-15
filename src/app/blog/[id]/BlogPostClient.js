"use client";

import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // Allows HTML inside Markdown (Remove if unsafe)
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

        {/* Blog Title */}
        <h1 className="text-5xl font-extrabold leading-tight text-center">
          {post.title}
        </h1>

        {/* Author & Date */}
        <p className="text-gray-600 text-center mt-3">
          By <span className="font-medium">{post.author?.name || "Anonymous"}</span> •{" "}
          {post.formattedDate}
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
            src={`/placeholder.svg?height=300&width=800&text=${encodeURIComponent(post.title)}`}
            alt={post.title}
            className="my-8 w-full rounded-lg shadow-md object-cover"
          />
        )}
        {console.log(post.content)}
        {/* Markdown Content */}
        <article className="prose lg:prose-xl dark:prose-invert leading-relaxed">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
    components={{
      h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-6 mb-4" {...props} />,
      h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold mt-5 mb-3" {...props} />,
      h3: ({ node, ...props }) => <h3 className="text-2xl font-medium mt-4 mb-2" {...props} />,
      p: ({ node, ...props }) => <p className="text-lg leading-relaxed mb-4" {...props} />,
    }}
  >
    {post.content}
  </ReactMarkdown>
</article>


      </div>

      <Footer />
    </>
  );
}
