"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Search, X, UserSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Header() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt");
      const username = localStorage.getItem("username");
      const profileImage = localStorage.getItem("profileImage");

      if (token && username) {
        setUser({
          name: username,
          profileImage:
            profileImage && profileImage !== "null"
              ? profileImage
              : "/placeholder.png",
        });
      }
    }
  }, []);

  // Only fetch users when search is shown to avoid unnecessary API calls
  useEffect(() => {
    if (showSearch && users.length === 0) {
      fetchUsers();
    }
  }, [showSearch, users.length]);

  const fetchUsers = async () => {
    try {
      setSearchLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt");
      localStorage.removeItem("username");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("email");
      setUser(null);
      router.push("/");
    }
  };

  const handleUserSelect = (user) => {
    setShowSearch(false);
    setSearchQuery("");
    setFilteredUsers([]);
    // Navigate to user profile using email
    router.push(`/profile/${encodeURIComponent(user.email)}`);
  };

  // Helper function to get profile image for specific users or validate URLs
  const getProfileImageForUser = (user) => {
    // For users, validate their profile image URL
    if (
      !user.profileImage ||
      user.profileImage === "null" ||
      user.profileImage === "undefined"
    ) {
      return null;
    }

    // Check if the URL is already absolute (starts with http or https)
    if (
      user.profileImage.startsWith("http://") ||
      user.profileImage.startsWith("https://")
    ) {
      return user.profileImage;
    }

    // Check if it's a local path that should start with a slash
    if (!user.profileImage.startsWith("/")) {
      return `/${user.profileImage}`;
    }

    return user.profileImage;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={50} strokeWidth={1.5} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetTitle className="m-5">Menu</SheetTitle>

              {/* User auth in sidebar for mobile */}
              {user ? (
                <div className="flex flex-col gap-2 p-4 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {user.profileImage && user.profileImage !== "null" ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      ) : (
                        <span className="text-gray-500 text-lg font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="font-medium">{user.name}</div>
                  </div>
                  <Button
                    onClick={() => router.push("/profile")}
                    variant="outline"
                    size="sm"
                    className="w-full">
                    Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    size="sm"
                    className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-4 border-b">
                  <Link href="/login?tab=login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/login?tab=register" className="w-full">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Navigation links */}
              <nav className="flex flex-col gap-4 p-4 mt-2">
                <Link href="/" className="text-lg font-medium">
                  Home
                </Link>
                <Link href="/blog" className="text-lg font-medium">
                  Blog
                </Link>
                <Link href="/about" className="text-lg font-medium">
                  About
                </Link>
                <Link href="/contact" className="text-lg font-medium">
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold logo mx-5">SmartBlog</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="font-medium text-base">
              Home
            </Link>
            <Link href="/blog" className="font-medium text-base">
              Blog
            </Link>
            <Link href="/about" className="font-medium text-base">
              About
            </Link>
            <Link href="/contact" className="font-medium text-base">
              Contact
            </Link>
          </nav>
        </div>

        {/* Desktop search and auth */}
        <div className="flex items-center gap-2 relative">
          {showSearch ? (
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search users..."
                className="w-[200px] pr-8"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setFilteredUsers([]);
                }}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>

              {/* Search Results Dropdown */}
              {searchQuery.trim() !== "" && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md z-50">
                  {searchLoading ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      Loading users...
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id || user.email}
                          className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => handleUserSelect(user)}>
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-200 flex items-center justify-center">
                            {(() => {
                              const profileImage = getProfileImageForUser(user);
                              if (profileImage) {
                                return (
                                  <img
                                    src={profileImage}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/placeholder.png";
                                    }}
                                  />
                                );
                              } else {
                                return (
                                  <div className="text-gray-400 font-bold text-sm">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            {user.email && (
                              <span className="text-xs text-gray-500">
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Only show auth buttons on desktop */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/profile")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2">
                  {user.profileImage && user.profileImage !== "null" ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {user.name}
                </Button>
                <Button onClick={handleLogout} variant="destructive" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login?tab=login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/login?tab=register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
