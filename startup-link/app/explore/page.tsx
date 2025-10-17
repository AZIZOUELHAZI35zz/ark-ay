"use client";

import { motion } from "framer-motion";
import StartupCard from "@/components/StartupCard";

const sample = [
  { name: "AI Mentor", description: "Personalized career guidance using LLMs.", category: "Tech", founderName: "Alice" },
  { name: "GreenChain", description: "Track carbon footprints across supply chains.", category: "Sustainability", founderName: "Mark" },
  { name: "FinSense", description: "Smart budgeting for freelancers.", category: "FinTech", founderName: "Nora" },
];

export default function ExplorePage() {
  return (
    <section className="container-xl py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Explore startups</h1>
        <input
          placeholder="Rechercher..."
          className="rounded-2xl border border-black/10 px-4 h-11 w-64 max-w-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
      >
        {sample.map((s) => (
          <StartupCard key={s.name} {...s} />
        ))}
      </motion.div>
    </section>
  );
}
