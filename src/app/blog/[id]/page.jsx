import { notFound } from "next/navigation";
import { getPost } from "@/lib/getPost";
import BlogPostClient from "./BlogPostClient";

export default async function BlogPostPage({ params }) {
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
