import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Trash2, Pencil, Loader2, User, Clock, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const BlogCard = ({ post, onDelete, onUpdate, loggedInEmail, isDeleting }) => {
  const router = useRouter()
  return (
    <Card className="overflow-hidden border-none shadow-none hover:shadow-xl transition-all duration-500 p-4 pb-0 bg-transparent group">
      {/* Image Section - Lowered with intentional spacing */}
      <div 
        onClick={() => router.push(`/blog/${post.id}`)} 
        className="relative w-full h-60 cursor-pointer rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500"
      >
        <Image
          src={post.imageUrl || "/placeholder.svg"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Blurred Bottom Overlay for Text Visibility */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 backdrop-blur-[2px] z-10">
          <div className="flex flex-col gap-2 transform transition-transform duration-500 group-hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/10 backdrop-blur-xl text-[10px] uppercase tracking-wider font-bold">
                  {post.category}
                </Badge>
                {post.published === false && (
                  <Badge variant="outline" className="text-orange-400 border-orange-400/50 bg-orange-400/10 backdrop-blur-xl text-[10px] uppercase font-bold">
                    Draft
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{post.date}</span>
            </div>
            <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
              {post.title}
            </h3>
          </div>
        </div>
      </div>
      
      {/* Card Content - Subtle Excerpt */}
      <CardContent className="px-1 py-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed italic">
          "{post.excerpt}"
        </p>
      </CardContent>

      {/* Card Footer - Minimalist Author & Actions */}
      <CardFooter className="px-1 pb-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <User className="h-3.5 w-3.5 mr-1.5 opacity-70" />
            {post.author.name || "Anonymous"}
          </div>

          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
            {post.readTime}
          </div>
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <Eye className="h-3.5 w-3.5 mr-1.5 opacity-70" />
            {post.views || 0}
          </div>
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="mr-1.5 text-sm leading-none">👏</span>
            {post.claps || 0}
          </div>
        </div>

        {/* Update and Delete Buttons */}
        {post.author.email === loggedInEmail && (
          <div className="flex items-center gap-3">
            <button
              className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
              onClick={(e) => { e.stopPropagation(); onUpdate(post); }}
              title="Edit post"
            >
              <Pencil className="h-4.5 w-4.5" />
              <span className="sr-only">Edit post</span>
            </button>
            <button
              className="text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
              disabled={isDeleting}
              title="Delete post"
            >
              {isDeleting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Trash2 className="h-4.5 w-4.5" />
              )}
              <span className="sr-only">Delete post</span>
            </button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
