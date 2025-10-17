"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import MessageBubble from "@/components/MessageBubble";
import Button from "@/components/Button";
import type { MessageDoc } from "@/app/api/firebaseConfig";

type UIMessage = MessageDoc & { id: string };

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [peerId, setPeerId] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const chatId = useMemo(() => {
    if (!user || !peerId) return undefined;
    const pair = [user.uid, peerId].sort().join("__");
    return pair;
  }, [user, peerId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as MessageDoc) }));
      setMessages(data);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!user || !chatId || !text.trim()) return;
    await addDoc(collection(db, "messages"), {
      chatId,
      senderId: user.uid,
      receiverId: peerId,
      message: text.trim(),
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <section className="container-xl py-10">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm text-black/60 mb-1">Receiver user ID</label>
          <input
            value={peerId}
            onChange={(e) => setPeerId(e.target.value)}
            placeholder="Enter a user UID to chat"
            className="w-full h-11 px-4 rounded-2xl border border-black/10"
          />
        </div>
        <div className="w-[200px] text-right">
          <p className="text-xs text-black/60 mb-1">Status</p>
          <p className="text-sm">{user ? `Signed in as ${user.email || user.uid}` : "Not signed in"}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white shadow-md h-[60vh] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} text={m.message} isOwn={m.senderId === user?.uid} />
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-black/5 p-3 flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder={user ? "Write a message..." : "Sign in to start chatting"}
            className="flex-1 h-11 px-4 rounded-2xl border border-black/10"
            disabled={!user}
          />
          <Button onClick={sendMessage} disabled={!user || !text.trim()}>Send</Button>
        </div>
      </div>
    </section>
  );
}
