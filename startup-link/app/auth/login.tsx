"use client";

import Button from "@/components/Button";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const handleGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <section className="container-xl py-16">
      <div className="max-w-md mx-auto rounded-2xl border border-black/5 shadow-md p-8 bg-white">
        <h1 className="text-2xl font-semibold tracking-tight">Se connecter</h1>
        <p className="text-black/70 mt-2 text-sm">Utilisez Google pour une connexion rapide.</p>
        <Button onClick={handleGoogle} className="mt-6 w-full">Sign in with Google</Button>
      </div>
    </section>
  );
}
