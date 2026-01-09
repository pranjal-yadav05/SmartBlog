"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function UnsubscribePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const { addToast } = useToast();

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      addToast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${API_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        addToast({
          title: "Successfully Unsubscribed",
          description: "You've been removed from our newsletter list.",
        });
      } else {
        // Handle not found case
        if (response.status === 404) {
          setStatus("error");
          addToast({
            title: "Not Subscribed",
            description: "This email is not subscribed to our newsletter.",
          });
        } else {
          throw new Error(data.message || "Failed to unsubscribe");
        }
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setStatus("error");
      addToast({
        title: "Error",
        description:
          "There was an error processing your request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Unsubscribe from Newsletter
                </CardTitle>
                <CardDescription>
                  Enter your email to unsubscribe from our weekly newsletter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting || status === "success"}
                      required
                    />
                  </div>

                  {status === "success" ? (
                    <div className="flex items-center p-4 text-sm border rounded-md bg-green-50 text-green-600 border-green-200">
                      <Check className="w-5 h-5 mr-2" />
                      <p>
                        You've been successfully unsubscribed from our
                        newsletter.
                      </p>
                    </div>
                  ) : status === "error" ? (
                    <div className="flex items-center p-4 text-sm border rounded-md bg-red-50 text-red-600 border-red-200">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <p>This email is not subscribed to our newsletter.</p>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || status === "success" || !email}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : status === "success" ? (
                      "Unsubscribed"
                    ) : (
                      "Unsubscribe"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
