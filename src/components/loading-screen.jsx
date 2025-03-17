"use client"
import { useState, useEffect } from "react";
import SmartBlogLogo from "./smart-blog-logo";
import { Loader2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LoadingScreen = ({ message }) => {
  const [showDelayButton, setShowDelayButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="container max-w-4xl px-4 md:px-6 text-center">
        {/* Logo with responsive classes */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-8">
          <SmartBlogLogo />
        </div>

        {/* Spinning Loader & Custom Message */}
        <div className="flex items-center justify-center gap-2 mt-4 text-center flex-wrap">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <p className="text-sm sm:text-base">{message}</p>
        </div>

        {/* Show "Why is this slow?" button after 5 seconds */}
        {showDelayButton && (
          <div className="flex justify-center mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  Why is this slow?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Why the Delay? ⏳</DialogTitle>
                  <DialogDescription>
                    The server runs on a free-tier Render deployment, which means it goes to sleep when inactive.
                    Waking it up can take 50-60 seconds. Once started, it runs smoothly! 🚀  
                    <br /><br />
                    This is a temporary limitation due to budget constraints.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Got it</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;