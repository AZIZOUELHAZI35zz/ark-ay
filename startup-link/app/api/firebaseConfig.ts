export const FIREBASE_COLLECTIONS = {
  users: "users",
  startups: "startups",
  messages: "messages",
} as const;

export type UserDoc = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  joinedAt: number; // unix ms
};

export type StartupDoc = {
  id: string;
  name: string;
  description: string;
  category: string;
  founderId: string;
  createdAt: number; // unix ms
};

export type MessageDoc = {
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number; // unix ms
};
