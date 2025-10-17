"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut, MessageCircle, Search, UserRound } from "lucide-react";
import Button from "@/components/Button";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
    return () => unsub();
  }, []);

  const initials = useMemo(() => {
    const displayName = user?.displayName || user?.email || "";
    return displayName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/5">
      <nav className="container-xl flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="StartupLink" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold tracking-tight">StartupLink</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 ml-6 text-sm">
            <Link href="/" className="hover:text-[--color-primary]">Home</Link>
            <Link href="/explore" className="hover:text-[--color-primary] flex items-center gap-1">
              <Search className="h-4 w-4" /> Explore
            </Link>
            <Link href="/messages" className="hover:text-[--color-primary] flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> Messages
            </Link>
            <Link href="/profile" className="hover:text-[--color-primary] flex items-center gap-1">
              <UserRound className="h-4 w-4" /> Profile
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile" className="hidden sm:flex items-center gap-2">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="avatar" width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[--color-primary] text-white grid place-items-center text-xs">
                    {initials}
                  </div>
                )}
                <span className="max-w-[140px] truncate text-sm">{user.displayName || user.email}</span>
              </Link>
              <Button onClick={handleLogout} variant="secondary" size="sm" aria-label="Logout">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <Button onClick={handleGoogle} size="sm" aria-label="Login with Google">
              <LogIn className="h-4 w-4 mr-1" /> Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
