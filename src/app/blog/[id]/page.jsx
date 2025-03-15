import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Header } from "@/components/header";

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
    <>
    <Header/>
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-5xl font-extrabold leading-tight text-center">{post.title}</h1>
      <p className="text-gray-600 text-center mt-3">
        By <span className="font-medium">{post.author?.username || "Anonymous"}</span> • {new Date(post.createdAt).toLocaleDateString()}
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
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
      </article>
    </div>
    <Footer/>
    </>
  );
}