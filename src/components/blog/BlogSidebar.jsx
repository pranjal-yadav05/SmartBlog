"use client";

import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function BlogSidebar({
  categories,
  selectedCategory,
  handleCategorySelect,
  categorySearchQuery,
  setCategorySearchQuery,
  loadingMoreCategories,
  fetchCategories,
  categoryPage,
  totalCategoryPages,
  recentPosts,
  subscribeEmail,
  setSubscribeEmail,
  handleSubscribe,
  subscribing,
}) {
  return (
    <div className="w-full md:w-80 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Categories</CardTitle>
            {categories.length > 5 && (
              <Badge variant="secondary" className="font-normal">
                {categories.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="h-9 pl-8 text-sm bg-gray-50/50 dark:bg-gray-900/50"
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((category, index) => (
              <div key={index}>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategorySelect(category.name);
                  }}
                  className={`flex justify-between items-center px-2 py-2 rounded-md transition-colors ${
                    selectedCategory === category.name
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}>
                  <span className="truncate mr-2">{category.name}</span>
                  <Badge
                    variant={
                      selectedCategory === category.name ? "default" : "secondary"
                    }
                    className="h-5 min-w-[20px] px-1 justify-center shrink-0">
                    {category.count}
                  </Badge>
                </Link>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-center py-4 text-sm text-gray-500">
                No categories found.
              </p>
            )}

            {categoryPage < totalCategoryPages - 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-primary"
                onClick={() => fetchCategories(categoryPage + 1, true)}
                disabled={loadingMoreCategories}>
                {loadingMoreCategories ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : null}
                Load More Categories
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentPosts.map((post, index) => (
              <div key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
                  className="block py-1 hover:text-primary">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </Link>
                {index < recentPosts.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscribe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Get the top 5 posts of the week delivered right to your inbox.
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Your email address"
              type="email"
              id="subscribe-email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={subscribing}>
              {subscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
