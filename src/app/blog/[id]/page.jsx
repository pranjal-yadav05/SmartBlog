import { notFound } from "next/navigation";

export async function getPost(id) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/api/posts/${id}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold">{post.title}</h1>
      <p className="text-gray-500 mt-2">By {post.author?.username || "Anonymous"} on {new Date(post.createdAt).toLocaleDateString()}</p>
      <img src={`/placeholder.svg?height=300&width=800&text=${encodeURIComponent(post.title)}`} alt={post.title} className="my-6 rounded-lg" />
      <div className="prose dark:prose-invert">{post.content}</div>
    </div>
  );
}
