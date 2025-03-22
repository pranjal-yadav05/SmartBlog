import { notFound } from "next/navigation";
import { getPost } from "@/lib/getPost";
import BlogPostClient from "./BlogPostClient";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";

// Loading component that will be shown while the main content is loading
function BlogPostLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex items-center justify-center">
        <LoadingScreen message="Fetching blog post..." />
      </main>
    </div>
  );
}

export default async function BlogPostPage({ params }) {
  return (
    <Suspense fallback={<BlogPostLoading />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}

async function BlogPostContent({ params }) {
  try {
    // Use Promise.resolve to handle params properly
    const resolvedParams = await Promise.resolve(params);

    if (!resolvedParams || !resolvedParams.id) {
      return notFound();
    }

    const postId = resolvedParams.id;
    const post = await getPost(postId);

    if (!post) {
      return notFound();
    }

    const formattedPost = {
      ...post,
      formattedDate: new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    return <BlogPostClient post={formattedPost} />;
  } catch (error) {
    console.error("Error loading blog post:", error);
    return notFound();
  }
}
