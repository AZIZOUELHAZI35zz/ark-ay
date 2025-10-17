"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/Button";

export default function Home() {
  return (
    <section className="container-xl py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Connect. Build. Launch.
        </h1>
        <p className="text-black/70 mt-4 text-lg">
          StartupLink relie entrepreneurs, investisseurs et talents pour partager des idées
          et collaborer sur des projets innovants.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <Link href="/explore">
            <Button size="lg">Explorer</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg">Se connecter</Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-semibold tracking-tight">Top Startup Ideas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/5 shadow-md p-5 bg-white h-32" />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
