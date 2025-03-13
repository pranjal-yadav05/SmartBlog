import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, User, Trash2 } from "lucide-react";

const BlogCard = ({ post, onDelete, loggedInEmail }) => {
 
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} width={400} height={200} className="object-cover" />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="text-sm text-gray-500">{post.date}</div>
        </div>
        <Link href={`/blog/${post.id}`}>
          <span className="text-primary hover:underline">{post.title}</span>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-500 line-clamp-3">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <User className="h-4 w-4 mr-1" />
          {console.log('author',post.author.email,'logged',loggedInEmail)}
          {post.author.name || "Anonymous"}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {post.readTime}
        </div>

        {/* ✅ Show Delete Button ONLY if user is the author */}
        {post.author.email === loggedInEmail && (
          <button
            className="ml-4 text-red-500 hover:text-red-700"
            onClick={() => onDelete(post.id)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
