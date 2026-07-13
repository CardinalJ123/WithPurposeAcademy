import { NextResponse } from "next/server";
import { adminDb, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * Streams a purchased course PDF (stored base64 in courseFiles/{id}) after
 * verifying the caller owns it (or is an admin). `?mode=download` forces a
 * file download; default renders inline for the in-site viewer.
 *
 * The client must call this with its Firebase ID token in the Authorization
 * header (via authedFetch) and turn the response into a blob URL — the bytes
 * are never exposed through a public link, so access stays buyer-only.
 */
export async function GET(req: Request) {
  try {
    const { decoded, userDoc } = await requireUser(req);
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId") ?? "";
    const mode = url.searchParams.get("mode") ?? "view";

    const isAdmin = userDoc?.role === "admin";
    if (!isAdmin) {
      const owned = await adminDb()
        .collection("purchases")
        .where("uid", "==", decoded.uid)
        .where("courseId", "==", courseId)
        .limit(1)
        .get();
      if (owned.empty) {
        return NextResponse.json({ error: "You do not own this course." }, { status: 403 });
      }
    }

    const [courseSnap, fileSnap] = await Promise.all([
      adminDb().collection("courses").doc(courseId).get(),
      adminDb().collection("courseFiles").doc(courseId).get(),
    ]);
    if (!fileSnap.exists) {
      return NextResponse.json({ error: "Course file not found." }, { status: 404 });
    }

    const { data } = fileSnap.data()!;
    const bytes = Buffer.from(String(data), "base64");
    const title = courseSnap.exists ? String(courseSnap.data()!.title) : "course";
    const safe = title.replace(/[^\w \-]/g, "").trim() || "course";
    const disposition =
      mode === "download" ? `attachment; filename="${safe}.pdf"` : "inline";

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "unauthenticated" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
