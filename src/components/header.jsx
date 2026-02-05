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
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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

  useEffect(() => {
    if (showSearch) {
      // Just focus the search field, don't load all users
      // No initial search when opening the search box
    }
  }, [showSearch]);

  // Debounced search effect
  useEffect(() => {
    // Don't do anything if search isn't shown
    if (!showSearch && !showMobileSearch) return;

    // Don't search if query is empty
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    // Adjust debounce time based on query length
    // Single letter searches should be faster to feel responsive
    const debounceTime = searchQuery.trim().length === 1 ? 100 : 300;

    // Set a delay before executing search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      fetchUsers(searchQuery);
    }, debounceTime);

    // Cleanup function to clear the timer if component unmounts or dependencies change
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, showSearch, showMobileSearch]);

  const fetchUsers = async (query = "") => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("jwt");

      // If the query is only one letter, use the initial letter endpoint
      if (query.trim().length === 1) {
        await fetchUsersByInitial(query.trim());
        return;
      }

      // Build the URL for the search endpoint
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/search`
      );

      // Add query parameters
      url.searchParams.append("query", query);
      url.searchParams.append("page", "0");
      url.searchParams.append("size", "10");

      // Setup request with appropriate headers
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Add authorization header if user is logged in
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        console.error("Search API error:", response.status);

        const fallbackResults = await fallbackSearch(query);

        if (fallbackResults && fallbackResults.length > 0) {
          setFilteredUsers(fallbackResults);
          setUsers(fallbackResults);
          return;
        } else {
          throw new Error(`Search failed with status: ${response.status}`);
        }
      }

      const data = await response.json();

      // Check if response has content property (paginated response)
      if (data.content && Array.isArray(data.content)) {
        setFilteredUsers(data.content);
        setUsers(data.content);
      }
      // Check if response is an array (non-paginated response)
      else if (Array.isArray(data)) {
        setFilteredUsers(data);
        setUsers(data);
      }
      // Handle unexpected response format
      else {
        console.error("Unexpected response format:", data);
        setFilteredUsers([]);
        setUsers([]);
        throw new Error("Unexpected response format from search API");
      }
    } catch (error) {
      console.error("Error searching users:", error.message);
      setFilteredUsers([]);
      setUsers([]);
      // Don't show error to user - just log it and show empty results
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to fetch users by initial letter
  const fetchUsersByInitial = async (initial) => {
    try {
      const token = localStorage.getItem("jwt");

      // Build the URL for the initial letter endpoint
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/by-initial/${initial}`
      );

      url.searchParams.append("page", "0");
      url.searchParams.append("size", "10");

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        console.error("Initial search API error:", response.status);
        // Try fallback search for initial as well
        const fallbackResults = await fallbackSearch(initial);
        if (fallbackResults && fallbackResults.length > 0) {
          setFilteredUsers(fallbackResults);
          setUsers(fallbackResults);
        } else {
          throw new Error(
            `Initial search failed with status: ${response.status}`
          );
        }
        return;
      }

      const data = await response.json();

      // Process the response data similarly to regular search
      if (data.content && Array.isArray(data.content)) {
        setFilteredUsers(data.content);
        setUsers(data.content);
      } else if (Array.isArray(data)) {
        setFilteredUsers(data);
        setUsers(data);
      } else {
        console.error(
          "Unexpected response format from initial search API:",
          data
        );
        setFilteredUsers([]);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users by initial:", error.message);
      // Try fallback search as a last resort
      try {
        const fallbackResults = await fallbackSearch(initial);
        setFilteredUsers(fallbackResults);
        setUsers(fallbackResults);
      } catch (fallbackError) {
        setFilteredUsers([]);
        setUsers([]);
      }
    }
  };

  // Fallback search function for when the main search API fails
  const fallbackSearch = async (query) => {
    try {

      // For single character searches, add wildcard-like behavior
      const searchTerm = query.trim().length === 1 ? `${query}%` : query;

      // Build the URL for the fallback search endpoint
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
      url.searchParams.append("search", searchTerm);

      const token = localStorage.getItem("jwt");
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Add authorization header if user is logged in
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        console.error("Fallback search also failed:", response.status);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error in fallback search:", error.message);
      return [];
    }
  };

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
    setShowMobileSearch(false);
    setSearchQuery("");
    setFilteredUsers([]);

    // Check if we have all the required fields to navigate
    if (!user || !user.email) {
      console.error(
        "Cannot navigate to user profile: Missing user email",
        user
      );
      return;
    }

    // Store the selected user data in localStorage for easier access
    try {
      // Store all user information to ensure we can reconstruct the profile
      // if the API search fails
      localStorage.setItem("viewedUserName", user.name || "Unknown User");
      localStorage.setItem("viewedUserEmail", user.email);

      // Handle profile image
      if (user.profileImage) {
        const profileImageUrl = getProfileImageForUser(user);
        localStorage.setItem("viewedUserProfileImage", profileImageUrl);
      } else {
        // Clear previous profile image if user doesn't have one
        localStorage.removeItem("viewedUserProfileImage");
      }

      // Store full user object as JSON for backup
      try {
        const userForStorage = {
          ...user,
          profileImageUrl: user.profileImage
            ? getProfileImageForUser(user)
            : null,
        };
        localStorage.setItem("viewedUserData", JSON.stringify(userForStorage));
      } catch (jsonError) {
        console.error("Error stringifying user data:", jsonError);
      }

    } catch (error) {
      console.error("Error storing viewed user data", error);
    }

    // This is a crucial fix for the "user not found" issue - ensure the email is properly encoded
    const encodedEmail = encodeURIComponent(user.email);
    router.push(`/profile/${encodedEmail}`);
  };

  // Helper function to get profile image for specific users or validate URLs
  const getProfileImageForUser = (user) => {
    // Handle null/undefined user
    if (!user) return "/placeholder.png";

    // For users, validate their profile image URL
    if (
      !user.profileImage ||
      user.profileImage === "null" ||
      user.profileImage === "undefined" ||
      user.profileImage === ""
    ) {
      return "/placeholder.png";
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

  const handleCloseSearch = () => {
    setShowSearch(false);
    setShowMobileSearch(false);
    setSearchQuery("");
    setFilteredUsers([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
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
              <div className="flex items-center justify-between pb-2 px-4 border-b">
                <span className="text-sm font-medium">Appearance</span>
                <ThemeToggle />
              </div>
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
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
              setFilteredUsers([]);
              setSearchQuery("");
            }}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Desktop search */}
          {showSearch ? (
            <div className="relative hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-[240px] pl-9 pr-10 h-10 border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-primary"
                  autoFocus
                  aria-label="Search users"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={handleCloseSearch}
                  aria-label="Close search">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop Search Results Dropdown - contained within the parent */}
              <div className="absolute w-full">{renderSearchResults()}</div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => {
                setShowSearch(true);
                setFilteredUsers([]);
                setSearchQuery("");
              }}
              aria-label="Open search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Only show auth buttons on desktop */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            <ThemeToggle />
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
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
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

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-background">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 h-10 border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:ring-primary"
              autoFocus
              aria-label="Search users"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchLoading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={handleCloseSearch}
                aria-label="Close search">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Search Results - positioned correctly */}
          <div className="relative">{renderSearchResults()}</div>
        </div>
      )}
    </header>
  );

  // Helper function to render search results
  function renderSearchResults() {
    // Only show any results container if there's actual loading or results
    if (
      !searchLoading &&
      filteredUsers.length === 0 &&
      searchQuery.trim() === ""
    ) {
      return null;
    }

    // Add different classes for mobile vs desktop
    const containerClasses = showMobileSearch
      ? "mt-2 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-800 w-full z-40"
      : "mt-2 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-800 absolute top-full left-0 right-0 z-50";

    return (
      <div className={containerClasses}>
        {searchLoading ? (
          <div className="p-4 text-center">
            <svg
              className="animate-spin h-5 w-5 text-gray-400 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-500 mt-2">Searching users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="max-h-72 overflow-y-auto">
            <div className="py-1 border-b border-gray-100 dark:border-gray-800 px-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Search results for "{searchQuery}"
              </p>
            </div>
            <ul className="py-1">
              {filteredUsers.map((user) => (
                <li key={user.id || `user-${user.email}`}>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <img
                        src={getProfileImageForUser(user)}
                        alt={user.name || "User"}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {user.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email || "No email available"}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Click to view profile
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : searchQuery.trim() !== "" ? (
          <div className="p-4 text-center border-t border-gray-100">
            <UserSearch className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No users found for "{searchQuery}"
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="p-4 text-center">
            <UserSearch className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Type to search for users</p>
            <p className="text-xs text-gray-400 mt-1">
              Search by name or email
            </p>
          </div>
        )}
      </div>
    );
  }
}
