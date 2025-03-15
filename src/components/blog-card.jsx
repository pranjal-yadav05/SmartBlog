import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, User, Trash2 } from "lucide-react";

const BlogCard = ({ post, onDelete, loggedInEmail }) => {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative w-full h-48">
        <Image
          src={post.imageUrl || "/placeholder.svg"}
          alt={post.title}
          layout="fill"
          objectFit="cover"
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      
      {/* Card Header */}
      <CardHeader className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="text-sm text-gray-500">{post.date}</div>
        </div>
        <Link href={`/blog/${post.id}`} passHref>
          <span className="text-lg font-semibold text-primary hover:underline">{post.title}</span>
        </Link>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="p-4 pt-0">
        <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Author Section */}
        <div className="flex items-center text-sm text-gray-500">
          <User className="h-4 w-4 mr-2" />
          {post.author.name || "Anonymous"}
        </div>

        {/* Read Time Section */}
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          {post.readTime} min read
        </div>

        {/* Delete Button (Visible only for the author) */}
        {post.author.email === loggedInEmail && (
          <button
            className="ml-4 text-red-500 hover:text-red-700"
            onClick={() => onDelete(post.id)}
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Delete post</span>
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
