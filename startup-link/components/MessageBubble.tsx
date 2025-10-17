"use client";

import { motion } from "framer-motion";

export type MessageBubbleProps = {
  text: string;
  isOwn?: boolean;
  timestamp?: string;
};

export default function MessageBubble({ text, isOwn, timestamp }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={
        `max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-md ${
          isOwn ? "bg-[--color-primary] text-white ml-auto" : "bg-black/5 text-black"
        }`
      }
    >
      <p>{text}</p>
      {timestamp && (
        <p className={`mt-1 text-[10px] ${isOwn ? "text-white/80" : "text-black/50"}`}>{timestamp}</p>
      )}
    </motion.div>
  );
}
