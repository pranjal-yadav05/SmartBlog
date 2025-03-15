import { notFound } from "next/navigation";
import { getPost } from "@/lib/getPost";
import BlogPostClient from "./BlogPostClient";

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  // Ensure consistent date formatting
  const formattedPost = {
    ...post,
    formattedDate: new Date(post.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  return <BlogPostClient post={formattedPost} />;
}
