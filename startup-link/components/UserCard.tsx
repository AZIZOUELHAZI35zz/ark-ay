"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type UserCardProps = {
  name: string;
  bio?: string;
  photoURL?: string;
  skills?: string[];
};

export default function UserCard({ name, bio, photoURL, skills }: UserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-black/5 shadow-md p-5 bg-white hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-4">
        {photoURL ? (
          <Image src={photoURL} alt={name} width={48} height={48} className="rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-[--color-primary]/15 grid place-items-center text-[--color-primary] font-semibold">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold leading-none">{name}</p>
          {bio && <p className="text-sm text-black/60 mt-1 line-clamp-2">{bio}</p>}
        </div>
      </div>
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((s) => (
            <span key={s} className="text-xs px-2 py-1 rounded-full bg-black/5">
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
