"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  Sparkles,
  X,
  Upload,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PreviewModal } from "./PreviewModal";

export function CreatePostDialog({
  open,
  onOpenChange,
  isUpdateMode,
  isDraftEditMode,
  postToUpdate,
  draftToUpdate,
  newPost,
  setNewPost,
  handleInputChange,
  handleCreatePost,
  handleUpdatePost,
  isDraftSubmitting,
  isPublishSubmitting,
  availableCategories,
  categories, // passed from parent
  handleGetAISuggestions,
  generating,
  aiSuggestions,
  setAiSuggestions, // needed to clear
  showAiSuggestions,
  setShowAiSuggestions,
  aiError,
  setAiError, // needed to clear
  user, // logged in user info for preview
}) {
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const markdownInputRef = useRef(null);

  // Helper to construct the post object for preview
  const getPreviewPost = () => ({
    title: newPost.title,
    content: newPost.content,
    image: newPost.image || (isUpdateMode ? postToUpdate?.imageUrl : draftToUpdate?.imageUrl),
  });

  const handleMarkdownImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".md")) {
      alert("Please select a .md file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        let content = event.target.result;
        if(content) {
            content = content.replace(/\r\n/g, "\n");
            content = content.replace(/\\([#*_\-!\[\]()>])/g, "$1");
            content = content.replace(/&nbsp;/g, " ");
            content = content.replace(/\n{3,}/g, "\n\n");
            content = content.trimEnd();
        }
        setNewPost((prev) => ({ ...prev, content }));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          onOpenChange(val);
          // if closing, clear some local UI state
          if (!val) {
            setShowCategorySuggestions(false);
            setShowAiSuggestions(false);
            setAiSuggestions("");
            setAiError("");
          }
        }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isUpdateMode
                ? "Update Blog Post"
                : isDraftEditMode
                ? "Update Draft"
                : "Create New Blog Post"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={
              isUpdateMode
                ? (e) => handleUpdatePost(e, true) // default submit is publish
                : (e) => handleCreatePost(e, true)
            }>
            <div className="grid gap-4 py-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter post title"
                  value={newPost.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Category */}
              <div className="grid gap-2 relative">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <Input
                    id="category"
                    name="category"
                    placeholder="Type to search or create category..."
                    value={newPost.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPost((prev) => ({ ...prev, category: val }));
                      setShowCategorySuggestions(true);
                    }}
                    onFocus={() => setShowCategorySuggestions(true)}
                    onBlur={() => {
                        // Delay hiding
                      setTimeout(() => setShowCategorySuggestions(false), 200);
                    }}
                    autoComplete="off"
                  />
                  {showCategorySuggestions &&
                    availableCategories
                      .concat(categories.map((c) => c.name))
                      .filter(
                        (name, index, self) =>
                          self.indexOf(name) === index &&
                          name
                            .toLowerCase()
                            .includes(newPost.category.toLowerCase())
                      ).length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {availableCategories
                          .concat(categories.map((c) => c.name))
                          .filter(
                            (name, index, self) =>
                              self.indexOf(name) === index &&
                              name
                                .toLowerCase()
                                .includes(newPost.category.toLowerCase())
                          )
                          .map((cat, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                              onMouseDown={() => {
                                setNewPost((prev) => ({
                                  ...prev,
                                  category: cat,
                                }));
                                setShowCategorySuggestions(false);
                              }}>
                              {cat}
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="grid gap-2">
                <Label htmlFor="image">
                  {isUpdateMode || isDraftEditMode
                    ? "Update Image (optional)"
                    : "Upload Image"}
                </Label>
                {/* Current Image previews */}
                {isUpdateMode && postToUpdate?.imageUrl && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500 mb-2">Current image:</p>
                    <img
                      src={postToUpdate.imageUrl}
                      alt="Current post image"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
                 {isDraftEditMode && draftToUpdate?.imageUrl && (
                    <div className="mb-2">
                        <p className="text-sm text-gray-500 mb-2">Current draft image:</p>
                        <img
                          src={draftToUpdate.imageUrl}
                          alt="Current draft image"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                     </div>
                 )}

                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                />
                
                {/* New Image Preview */}
                {newPost.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">
                      New image preview:
                    </p>
                    <img
                      src={URL.createObjectURL(newPost.image)}
                      alt="New post image preview"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".md"
                      ref={markdownInputRef}
                      className="hidden"
                      onChange={handleMarkdownImport}
                    />
                    <button
                      type="button"
                      onClick={() => markdownInputRef.current?.click()}
                      className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Upload className="h-3 w-3" /> Import Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMarkdownGuide(!showMarkdownGuide)}
                      className="text-xs text-primary hover:underline flex items-center gap-1">
                      {showMarkdownGuide ? "Hide Guide" : "Markdown Guide?"}
                    </button>
                  </div>
                </div>

                {/* Markdown Guide */}
                {showMarkdownGuide && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 mb-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div className="space-y-3">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Structure</p>
                              <p><span className="font-mono text-primary font-bold"># Heading 1</span> - Main Title</p>
                              <p><span className="font-mono text-primary font-bold">## Heading 2</span> - Major Section</p>
                              <p><span className="font-mono text-primary font-bold">### Heading 3</span> - Sub Section</p>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Emphasis</p>
                              <p><span className="font-mono text-primary font-bold">**Bold**</span> or <span className="font-mono text-primary font-bold">__Bold__</span></p>
                              <p><span className="font-mono text-primary font-bold">*Italic*</span> or <span className="font-mono text-primary font-bold">_Italic_</span></p>
                              <p><span className="font-mono text-primary font-bold">~~Strikethrough~~</span></p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Lists & Links</p>
                              <p><span className="font-mono text-primary font-bold">- List Item</span> (or <span className="font-mono text-primary font-bold">*</span> or <span className="font-mono text-primary font-bold">+</span>)</p>
                              <p><span className="font-mono text-primary font-bold">1. Numbered Item</span></p>
                              <p><span className="font-mono text-primary font-bold">[Link Text](URL)</span></p>
                              <p><span className="font-mono text-primary font-bold">![Alt Text](Img URL)</span></p>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-200 mb-1">Advanced</p>
                              <p><span className="font-mono text-primary font-bold">{`>`} Quote</span> - For callouts</p>
                              <p><span className="font-mono text-pink-500 font-bold">`inline code`</span> - Single backticks</p>
                              <p><span className="font-mono text-pink-500 font-bold">```lang</span> - Code blocks</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t dark:border-gray-800 space-y-2">
                          <p className="italic">💡 <span className="font-bold">Pro Tip:</span> Use multiple headings to structure your content better and keep readers engaged!</p>
                        </div>
                      </div>
                )}

                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your blog post here and use AI for suggestions..."
                  className="h-[250px] max-h-[400px] overflow-y-auto font-mono text-sm leading-relaxed"
                  value={newPost.content}
                  onChange={handleInputChange}
                  required
                />

                {/* AI Suggestions */}
                {showAiSuggestions && (
                    <div className="mt-4 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Sparkles className="h-4 w-4" /> AI Suggestions
                          </h4>
                          <button 
                            type="button"
                            onClick={() => setShowAiSuggestions(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {generating ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3" />
                            <p className="text-sm text-blue-600 animate-pulse">Analyzing your content...</p>
                          </div>
                        ) : aiError ? (
                          <div className="flex items-start gap-2 text-red-500 dark:text-red-400 py-2">
                             <div className="mt-0.5">•</div>
                             <p className="text-sm leading-relaxed">{aiError}</p>
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {aiSuggestions}
                            </ReactMarkdown>
                          </div>
                        )}
                        
                        <p className="mt-4 text-[10px] text-blue-500/70 italic text-right italic">
                           Suggested by SmartBlog
                        </p>
                      </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetAISuggestions}
                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-auto sm:mr-0 w-full sm:w-auto"
                disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Suggestions
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPreviewOpen(true)}
                disabled={!newPost.title && !newPost.content}
                className="gap-2 w-full sm:w-auto"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={
                  isDraftSubmitting ||
                  isPublishSubmitting ||
                  !newPost.title ||
                  !newPost.content
                }
                onClick={() =>
                  isUpdateMode
                    ? handleUpdatePost(null, false)
                    : handleCreatePost(null, false)
                }>
                {isDraftSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={
                  isDraftSubmitting ||
                  isPublishSubmitting ||
                  !newPost.title ||
                  !newPost.content
                }
                onClick={() =>
                  isUpdateMode
                    ? handleUpdatePost(null, true)
                    : handleCreatePost(null, true)
                }>
                {isPublishSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isUpdateMode ? (
                  "Update Post"
                ) : (
                  "Publish Post"
                )}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isDraftSubmitting || isPublishSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* PREVIEW MODAL */}
      <PreviewModal 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        post={getPreviewPost()} 
        user={user}
      />
    </>
  );
}
