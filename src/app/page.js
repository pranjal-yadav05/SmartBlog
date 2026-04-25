"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Eye, Loader2, X, Save, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { FeaturedPosts } from "@/components/featured-posts";
import { useState, useEffect } from "react";
import Footer from "@/components/footer";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Demo Editor State
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoPost, setDemoPost] = useState({ title: "The Future of Web Dev", content: "Building applications has become much easier. Its important to stay up to date.", category: "Technology", image: null });
  const [demoAiSuggestions, setDemoAiSuggestions] = useState("");
  const [demoShowAi, setDemoShowAi] = useState(false);
  const [demoGenerating, setDemoGenerating] = useState(false);

  const handleDemoAI = () => {
    setDemoGenerating(true);
    setDemoShowAi(true);
    setTimeout(() => {
      setDemoGenerating(false);
      setDemoAiSuggestions("**AI Suggestion:** It is crucial to stay updated with the latest trends and technologies. \n\n*Note: This is a live demo! In the actual app, this connects to our backend to provide real AI insights.*");
    }, 1500);
  };

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("jwt");
    setIsLoggedIn(!!token);

    // Initialize IntersectionObserver for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    setTimeout(() => {
      document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem("smartblog-animated");

    if (hasAnimated) {
      setTypedTitle("SmartBlog");
      setIsTypingDone(true);
      return;
    }

    const FULL_TITLE = "SmartBlog";
    let index = 0;
    let timeoutId;

    const typeNext = () => {
      index += 1;
      setTypedTitle(FULL_TITLE.slice(0, index));

      if (index >= FULL_TITLE.length) {
        setTimeout(() => {
          setIsTypingDone(true);
          sessionStorage.setItem("smartblog-animated", "true");
        }, 800);

        return;
      }

      const char = FULL_TITLE[index - 1];
      const base = 100 + Math.random() * 150;
      const delay = char === char.toUpperCase() ? base + 100 : base;

      // ⏱️ random delay per character (human-like)
      const randomDelay = delay + Math.random() * 250; // 120ms – 300ms

      timeoutId = setTimeout(typeNext, randomDelay);
    };

    // initial delay before typing starts (optional, feels natural)
    timeoutId = setTimeout(typeNext, 200);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isMounted) return null;

  // Sections use inline JSX instead of array mapping for authentic layouts

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative w-full min-h-[calc(100vh)] py-20 md:py-32 lg:py-40 flex items-center overflow-hidden bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {/* Animated gradient orbs */}
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-glow hero-glow-3" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center">

              {/* Title */}
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl fade-up fade-up-d2">
                Welcome to{" "}
                <span className="mx-2 logo inline-flex items-center">
                  {typedTitle}
                  {!isTypingDone && (
                    <span className="ml-1 h-8 w-[2px] bg-current animate-pulse" />
                  )}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-6 max-w-[650px] text-lg md:text-xl text-gray-500 dark:text-gray-400 fade-up fade-up-d3">
                We{" "}
                <span
                  className={`inline-block transition-all duration-500 ease-out ${
                    isTypingDone
                      ? "font-semibold text-gray-900 dark:text-white scale-[1.03]"
                      : "font-normal text-gray-500 dark:text-gray-400 scale-100"
                  }`}
                >
                  present
                </span>{" "}
                what you want. You decide{" "}
                <span
                  className={`inline-block transition-all duration-500 ease-out delay-100 ${
                    isTypingDone
                      ? "font-semibold text-gray-900 dark:text-white scale-[1.03]"
                      : "font-normal text-gray-500 dark:text-gray-400 scale-100"
                  }`}
                >
                  what matters
                </span>
                .
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 mt-10 fade-up fade-up-d4">
                {!isLoggedIn ? (
                  <Link href="/login">
                    <Button size="lg" className="glow-btn px-8 text-base">
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <Link href="/profile">
                    <Button size="lg" variant="outline" className="px-8 text-base">
                      Go to Profile
                    </Button>
                  </Link>
                )}
                <Link href="/blog">
                  <Button size="lg" variant="outline" className="px-8 text-base">
                    Explore Blog
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="section-glow-line" />

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-900/80">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              <div className="space-y-8 fade-up text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="glass-pill text-muted-foreground mb-6 inline-flex">Your Writing Companion</span>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-5xl leading-tight">
                    Create, refine, <br/> and publish.
                  </h2>
                  <p className="mt-6 max-w-[500px] text-gray-500 dark:text-gray-400 md:text-lg">
                    Write your ideas naturally, and let our integrated AI tools suggest improvements to your grammar, structure, and tone before you hit publish.
                  </p>
                </div>

                <div className="flex flex-col gap-4 text-left w-full">
                   <div className="flex gap-4 items-start glass-card p-5 border-l-4 border-l-primary shadow-lg bg-background/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-bold mb-1">Start Drafting</h4>
                        <p className="text-sm text-muted-foreground">Open the editor and start writing your post using our clean, distraction-free interface.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start glass-card p-5 opacity-80 hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-bold mb-1">Get AI Suggestions</h4>
                        <p className="text-sm text-muted-foreground">Click the AI button to analyze your draft and receive actionable recommendations for tone, grammar, and structure.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start glass-card p-5 opacity-60 hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-bold mb-1">Publish to the World</h4>
                        <p className="text-sm text-muted-foreground">Generate a summary, add your tags, and publish your polished article instantly.</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Side Visual Mockup (Text Editor Inline) */}
              <div className="relative fade-up fade-up-d3 w-full lg:max-w-xl mx-auto lg:mx-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl blur-3xl opacity-50" />
                <div className="demo-frame p-0 shadow-2xl relative z-10 bg-background/95 backdrop-blur-3xl border-white/10 overflow-hidden flex flex-col h-[650px]">
                   {/* Header (like DialogHeader) */}
                   <div className="px-6 py-4 border-b border-border/50">
                     <h2 className="text-lg font-semibold tracking-tight">Create New Blog Post</h2>
                   </div>
                   
                   {/* Form Content (Scrollable) */}
                   <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                     {/* Title */}
                     <div className="grid gap-2 text-left">
                       <Label htmlFor="demo-title">Title</Label>
                       <Input id="demo-title" value={demoPost.title} onChange={(e) => setDemoPost({...demoPost, title: e.target.value})} />
                     </div>
                     {/* Category */}
                     <div className="grid gap-2 text-left">
                       <Label htmlFor="demo-category">Category</Label>
                       <Input id="demo-category" value={demoPost.category} onChange={(e) => setDemoPost({...demoPost, category: e.target.value})} />
                     </div>
                     {/* Content */}
                     <div className="grid gap-2 text-left mt-2">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                         <Label htmlFor="demo-content">Content</Label>
                         <div className="flex items-center gap-3">
                           <button type="button" className="text-xs text-primary hover:underline flex items-center gap-1">
                             <Upload className="h-3 w-3" /> Import Markdown
                           </button>
                           <button type="button" className="text-xs text-primary hover:underline flex items-center gap-1">
                             Markdown Guide?
                           </button>
                         </div>
                       </div>
                       <Textarea 
                         id="demo-content" 
                         className="h-[160px] font-mono text-sm leading-relaxed" 
                         value={demoPost.content}
                         onChange={(e) => setDemoPost({...demoPost, content: e.target.value})}
                       />
                     </div>

                     {/* AI Suggestions Box (Exact copy from CreatePostDialog) */}
                     {demoShowAi && (
                        <div className="mt-4 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 animate-in fade-in slide-in-from-top-2 text-left">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Sparkles className="h-4 w-4" /> AI Suggestions
                              </h4>
                              <button 
                                type="button"
                                onClick={() => setDemoShowAi(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {demoGenerating ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3" />
                                <p className="text-sm text-blue-600 animate-pulse">Analyzing your content...</p>
                              </div>
                            ) : (
                              <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-100">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {demoAiSuggestions}
                                </ReactMarkdown>
                              </div>
                            )}
                            
                            <p className="mt-4 text-[10px] text-blue-500/70 text-right italic">
                               Suggested by SmartBlog
                            </p>
                          </div>
                     )}
                   </div>

                   {/* Footer (like DialogFooter) */}
                   <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-2 sm:justify-end shrink-0">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={handleDemoAI}
                       className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-auto w-full sm:w-auto"
                       disabled={demoGenerating}>
                       {demoGenerating ? (
                         <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                       ) : (
                         <><Sparkles className="mr-2 h-4 w-4" /> AI Suggestions</>
                       )}
                     </Button>
                     <Button type="button" variant="ghost" className="gap-2 w-full sm:w-auto">
                       <Eye className="h-4 w-4" /> Preview
                     </Button>
                     <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => alert('Demo only! Sign in to save drafts.')}>
                       Save as Draft
                     </Button>
                     <Button type="button" className="w-full sm:w-auto" onClick={() => alert('Demo only! Sign in to publish posts.')}>
                       Publish Post
                     </Button>
                   </div>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Demo Dialog Removed (Using inline instead) */}
        </section>

        {/* ── Divider ── */}
        <div className="section-glow-line" />

        {/* ═══════════════ FEATURES (Bento Grid) ═══════════════ */}
        <section className="w-full py-20 md:py-32 bg-background dark:bg-gray-950">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className={`text-center mb-16 fade-up`}>
              <span className="glass-pill text-muted-foreground mb-4 inline-flex">Features</span>
              <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mt-4">
                Focus on writing. <br className="hidden sm:block"/> We handle the polishing.
              </h2>
              <p className="mx-auto mt-4 max-w-[550px] text-gray-500 dark:text-gray-400 md:text-lg">
                Enhance your blog posts with integrated tools designed to make your writing clear, concise, and professional.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Large Feature 1 */}
              <div className="md:col-span-2 glass-card p-0 flex flex-col overflow-hidden fade-up fade-up-d1 relative group">
                <div className="p-8 pb-0 z-10">
                  <h3 className="text-2xl font-bold mb-2">Intelligent Writing Assistant</h3>
                  <p className="text-muted-foreground">Click a single button to have our AI analyze your entire draft. Receive actionable suggestions on grammar, tone, and structure, rendered beautifully in Markdown.</p>
                </div>
                <div className="mt-8 flex-1 px-8 pt-0 relative flex items-end">
                  <div className="demo-frame border-b-0 rounded-b-none p-5 w-full h-full min-h-[160px] shadow-2xl translate-y-4 group-hover:translate-y-2 transition-transform duration-500 bg-background/90">
                     <div className="flex items-center gap-2 text-blue-500 mb-3 font-bold text-sm">
                        <Sparkles className="h-4 w-4" /> AI Suggestions
                     </div>
                     <div className="space-y-3 opacity-90">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <div className="text-xs text-muted-foreground"><strong className="text-foreground">Tone:</strong> Consider making the introduction slightly more engaging.</div>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <div className="text-xs text-muted-foreground"><strong className="text-foreground">Grammar:</strong> Fixed 2 minor punctuation errors in the second paragraph.</div>
                       </div>
                       <div className="flex items-center gap-2 mt-2">
                          <div className="px-2 py-1 bg-muted rounded text-[10px] font-mono">Original: Its important</div>
                          <div className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-[10px] font-mono">Suggestion: It's important</div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-8 flex flex-col gap-4 fade-up fade-up-d2 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-inner border border-white/10 overflow-hidden">
                  <Save className="h-6 w-6 text-purple-500 dark:text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold">Draft Management</h3>
                <p className="text-muted-foreground text-sm">Write at your own pace. Save your work-in-progress posts and seamlessly pick up where you left off from your dashboard.</p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-8 flex flex-col gap-4 fade-up fade-up-d3 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shadow-inner border border-white/10 overflow-hidden">
                  <Zap className="h-6 w-6 text-amber-500 dark:text-amber-400 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold">Blazing Fast</h3>
                <p className="text-muted-foreground text-sm">Optimized rendering ensures your content and images load for your readers in milliseconds.</p>
              </div>

              {/* Large Feature 4 */}
              <div className="md:col-span-2 glass-card p-8 flex flex-col md:flex-row gap-8 items-center fade-up fade-up-d4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Beautiful Markdown Support</h3>
                  <p className="text-muted-foreground">Write seamlessly with markdown. Easily format text, create lists, and embed code blocks without touching a menu.</p>
                </div>
                <div className="w-full md:w-1/2 demo-frame p-5 shadow-xl bg-background/90 text-sm">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="border-r border-border/50 pr-4 space-y-2 text-muted-foreground font-mono text-xs">
                        <div>## Introduction</div>
                        <div>Here is a list:</div>
                        <div>- Item one</div>
                        <div>- Item two</div>
                     </div>
                     <div className="pl-2 space-y-2">
                        <div className="font-bold text-base">Introduction</div>
                        <div className="text-muted-foreground">Here is a list:</div>
                        <ul className="list-disc list-inside text-muted-foreground pl-1">
                           <li>Item one</li>
                           <li>Item two</li>
                        </ul>
                     </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="section-glow-line" />

        {/* ═══════════════ FEATURED POSTS ═══════════════ */}
        <FeaturedPosts />

        {/* ── Divider ── */}
        <div className="section-glow-line" />

        {/* ═══════════════ DEMO / CTA SECTION ═══════════════ */}
        <section
          className="relative w-full py-20 md:py-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          {/* Background orbs */}
          <div className="hero-glow hero-glow-2" style={{ top: "-20%", right: "10%" }} />
          <div className="hero-glow hero-glow-3" style={{ bottom: "0%", left: "15%" }} />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
            {isLoggedIn ? (
              /* ── Logged-in view ── */
              <div className={`mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 fade-up`}>
                <div className="space-y-5">
                  <span className="glass-pill text-muted-foreground">Welcome Back</span>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mt-4">
                    Welcome Back to SmartBlog!
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                    Thanks for being a part of our community! Continue reading
                    articles or manage your profile.
                  </p>
                  <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2">
                    <Link href="/profile">
                      <Button size="lg" className="glow-btn">Go to Profile</Button>
                    </Link>
                    <Link href="/blog">
                      <Button size="lg" variant="outline">Explore New Articles</Button>
                    </Link>
                  </div>
                </div>
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-2">Continue Your Journey</h3>
                  <p className="text-muted-foreground text-sm mb-6">Benefits of being a member</p>
                  <div className="space-y-4">
                    {[
                      "Personalized content recommendations",
                      "Save and organize your favorite articles",
                      "Comment and engage with the community",
                      "Get notified about new content",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Not logged-in view ── */
              <div className={`mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 fade-up`}>
                <div className="space-y-5">
                  <span className="glass-pill text-muted-foreground">Join Us</span>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mt-4">
                    Join Our Community
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                    Create an account to get personalized content
                    recommendations, save your favorite articles, and engage
                    with other readers.
                  </p>
                  <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2">
                    <Link href="/login">
                      <Button size="lg" className="glow-btn">Sign Up Now</Button>
                    </Link>
                  </div>
                </div>
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-2">Why Join SmartBlog?</h3>
                  <p className="text-muted-foreground text-sm mb-6">Benefits of creating an account</p>
                  <div className="space-y-4">
                    {[
                      "Personalized content recommendations",
                      "Save and organize your favorite articles",
                      "Comment and engage with the community",
                      "Get notified about new content",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/login" className="block mt-8">
                    <Button className="w-full glow-btn">Create Account</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
