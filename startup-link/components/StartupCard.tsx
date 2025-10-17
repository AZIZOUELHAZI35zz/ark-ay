"use client";

import { motion } from "framer-motion";

export type StartupCardProps = {
  name: string;
  description: string;
  category: string;
  founderName?: string;
};

export default function StartupCard({ name, description, category, founderName }: StartupCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-black/5 shadow-md p-5 bg-white hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-[--color-primary]/10 text-[--color-primary]">
          {category}
        </span>
      </div>
      <p className="text-sm text-black/70 mt-2 line-clamp-3">{description}</p>
      {founderName && (
        <p className="text-xs text-black/60 mt-3">Founded by {founderName}</p>
      )}
    </motion.article>
  );
}
