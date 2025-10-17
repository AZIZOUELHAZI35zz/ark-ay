"use client";

import Button from "@/components/Button";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function SignupPage() {
  const handleGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <section className="container-xl py-16">
      <div className="max-w-md mx-auto rounded-2xl border border-black/5 shadow-md p-8 bg-white">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-black/70 mt-2 text-sm">Inscription rapide avec Google.</p>
        <Button onClick={handleGoogle} className="mt-6 w-full">Sign up with Google</Button>
      </div>
    </section>
  );
}
