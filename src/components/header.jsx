"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt");
      const username = localStorage.getItem("username");

      if (token && username) {
        setUser({ name: username });
      }
    }
  }, []);

  useEffect(() => {
    // Fetch users from API (replace with your actual API endpoint)
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
      return;
    }
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log(filtered)
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt");
      localStorage.removeItem("username");
      setUser(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-10 w-10" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="mx-10 flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium">Home</Link>
                <Link href="/blog" className="text-lg font-medium">Blog</Link>
                <Link href="/about" className="text-lg font-medium">About</Link>
                <Link href="/contact" className="text-lg font-medium">Contact</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex mx-5 items-center gap-2">
            <span className="text-xl font-bold logo">SmartBlog</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="font-medium text-base">Home</Link>
            <Link href="/blog" className="font-medium text-base">Blog</Link>
            <Link href="/about" className="font-medium text-base">About</Link>
            <Link href="/contact" className="font-medium text-base">Contact</Link>
          </nav>
        </div>
        <div className="flex items-center mx-5 gap-2 relative">
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
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
              {filteredUsers.length > 0 && (
                <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <img
                      src={user.profileImage || "/placeholder.png"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <span className="text-gray-800">{user.name}</span>
                  </div>
                ))}
              </div>              
              )}
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/profile')} variant="outline" size="sm">
                {user.name}
              </Button>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                  Login
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
