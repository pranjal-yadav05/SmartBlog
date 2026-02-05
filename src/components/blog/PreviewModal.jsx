"use client";

import { X, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function PreviewModal({ open, onOpenChange, post, user }) {
  if (!post) return null;

  // Format date similar to BlogPostClient
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper to determine image source for preview
  const getImageSrc = () => {
    if (post.image && post.image instanceof File) {
      return URL.createObjectURL(post.image);
    }
    if (post.image) return post.image; // If it's a URL string (from edit mode)
    return `/placeholder.svg?height=300&width=800&text=${encodeURIComponent(
      post.title || "Preview"
    )}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full p-0 gap-0 bg-white dark:bg-gray-950">
        <VisuallyHidden><DialogTitle>Preview</DialogTitle></VisuallyHidden>
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              Preview Mode
            </span>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="p-6 md:p-10 max-w-3xl mx-auto w-full">
          {/* Blog Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-center mb-6">
            {post.title || "Untitled Post"}
          </h1>

          <div className="flex items-center justify-center gap-4 text-gray-600 mb-8">
            <p className="text-sm">
              By{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user?.name || "You"}
              </span>{" "}
              • {formattedDate}
            </p>
          </div>

          {/* Cover Image */}
          <img
            src={getImageSrc()}
            alt={post.title}
            className="my-8 w-full rounded-lg shadow-md object-cover max-h-[500px]"
          />

          {/* Content */}
          <article className="prose lg:prose-xl dark:prose-invert leading-relaxed max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-4xl font-extrabold mt-12 mb-6 border-b pb-2 dark:border-gray-800"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-3xl font-bold mt-10 mb-4 text-primary"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-2xl font-bold mt-8 mb-4" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-lg leading-8 mb-6 text-gray-700 dark:text-gray-300"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong
                    className="font-bold text-gray-900 dark:text-white"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc list-outside ml-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal list-outside ml-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary pl-6 py-2 my-8 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-r-lg"
                    {...props}
                  />
                ),
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;

                  return isInline ? (
                    <code
                      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400 font-mono text-sm"
                      {...props}>
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
                img: ({ node, ...props }) => (
                  <img
                    className="rounded-xl shadow-xl border dark:border-gray-800 my-10 mx-auto max-h-[500px] object-cover"
                    {...props}
                  />
                ),
              }}>
              {post.content || "*No content yet*"}
            </ReactMarkdown>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
