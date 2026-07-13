const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Verified poker photography (Unsplash), matched to what they actually show. */
export const img = {
  handReveal: u("photo-1596451190630-186aff535bf2", 1400),
  handChips: u("photo-1626775238053-4315516eedc9", 1200),
  chipPile: u("photo-1542145177-4dc9b8029711", 1600),
  cardScatter: u("photo-1622975696911-c1c444035f43", 1600),
  blackGoldAces: u("photo-1655159428752-c700435e9983", 1400),
  deckOnFelt: u("photo-1560526396-82d093122bda", 1200),
};

export const site = {
  name: "With Purpose Academy",
  tagline: "Learn poker the disciplined way",
  description:
    "With Purpose Academy is a poker education platform. Structured, professional course material that turns guesswork into strategy.",
  email: "support@withpurposeacademy.com",
  address: "9 Nottingham Road, Wayside, NJ 07712",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
] as const;

export type UserStatus = "pending" | "approved" | "suspended";

export type UserDoc = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  status: UserStatus;
  role: "user" | "admin";
  createdAt: number;
};

export type Course = {
  id: string;
  title: string;
  summary: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  /** Price in USD cents */
  priceUsd: number;
  pages: number;
  published: boolean;
  createdAt: number;
};

/**
 * The PDF bytes for a course, stored base64 in its own document
 * (courseFiles/{courseId}) so the course doc stays small for the public
 * catalogue. Firestore's 1 MB/doc limit caps the raw PDF at ~700 KB.
 */
export const MAX_PDF_BYTES = 700 * 1024;
export type CourseFile = {
  data: string; // base64-encoded PDF
  contentType: string;
  size: number; // raw byte length
  updatedAt: number;
};

export type Purchase = {
  id: string;
  uid: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  createdAt: number;
};

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
