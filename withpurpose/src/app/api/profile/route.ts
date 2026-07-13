import { NextResponse } from "next/server";
import { adminDb, adminEmails, requireUser } from "@/lib/firebase-admin";

/**
 * Creates or updates the caller's profile (name only). New accounts start
 * as "pending" and must be approved by an admin before they can purchase.
 * Emails on the ADMIN_EMAILS list are seeded as approved admins.
 */
export async function POST(req: Request) {
  try {
    const { decoded } = await requireUser(req);
    const body = await req.json();
    const name = String(body.name ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    const ref = adminDb().collection("users").doc(decoded.uid);
    const snap = await ref.get();
    const email = (decoded.email ?? "").toLowerCase();
    const seedAdmin = adminEmails().includes(email);

    if (snap.exists) {
      await ref.set({ name }, { merge: true });
    } else {
      await ref.set({
        uid: decoded.uid,
        name,
        email,
        photoURL: decoded.picture ?? "",
        status: seedAdmin ? "approved" : "pending",
        role: seedAdmin ? "admin" : "user",
        createdAt: Date.now(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "unauthenticated" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
