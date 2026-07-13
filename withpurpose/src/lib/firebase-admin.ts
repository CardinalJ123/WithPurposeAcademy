import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-side Firebase. FIREBASE_SERVICE_ACCOUNT is the full service-account
 * JSON (or its base64) pasted into the environment — see SETUP.md.
 */
function loadCredentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set");
  const json = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(json);
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  return initializeApp({ credential: cert(loadCredentials()) });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());

/** Emails that automatically get the admin role on first sign-in. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifies the Bearer token of a request and returns the caller's decoded
 * token plus their Firestore user doc. Throws Response-like errors.
 */
export async function requireUser(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new Error("unauthenticated");
  const decoded = await adminAuth().verifyIdToken(token);
  const snap = await adminDb().collection("users").doc(decoded.uid).get();
  return { decoded, userDoc: snap.exists ? snap.data()! : null };
}

export async function requireAdmin(req: Request) {
  const { decoded, userDoc } = await requireUser(req);
  const isAdmin =
    userDoc?.role === "admin" ||
    adminEmails().includes((decoded.email ?? "").toLowerCase());
  if (!isAdmin) throw new Error("forbidden");
  return { decoded, userDoc };
}
