"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import Button from "@/components/Button";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <section className="container-xl py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-4 text-black/70">Veuillez vous connecter pour voir votre profil.</p>
      </section>
    );
  }

  return (
    <section className="container-xl py-12">
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          <Image src={user.photoURL} alt="avatar" width={64} height={64} className="rounded-full" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-[--color-primary]/15 grid place-items-center text-[--color-primary] font-semibold">
            {(user.displayName || user.email || "").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.displayName || user.email}</h1>
          <p className="text-black/60 text-sm">Membre depuis —</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-black/5 p-6 bg-white">
          <h2 className="font-semibold">Bio</h2>
          <p className="text-black/70 text-sm mt-2">Ajoutez une courte bio pour vous présenter.</p>
          <Button className="mt-4" variant="secondary">Modifier le profil</Button>
        </div>
        <div className="rounded-2xl border border-black/5 p-6 bg-white">
          <h2 className="font-semibold">Compétences</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-black/5">Design</span>
            <span className="px-2 py-1 rounded-full bg-black/5">Product</span>
            <span className="px-2 py-1 rounded-full bg-black/5">AI</span>
          </div>
        </div>
      </div>
    </section>
  );
}
