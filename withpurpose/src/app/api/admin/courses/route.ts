import { NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";
import { MAX_PDF_BYTES } from "@/lib/site";

export const runtime = "nodejs";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/** Reads and validates an uploaded PDF from a form field into a Buffer. */
async function readPdf(pdf: FormDataEntryValue | null) {
  if (!(pdf instanceof File) || pdf.type !== "application/pdf") {
    return { error: "Please attach the course PDF." as string };
  }
  if (pdf.size > MAX_PDF_BYTES) {
    return {
      error: `PDF must be under ${Math.round(MAX_PDF_BYTES / 1024)} KB. For larger files, switch to file storage (see SETUP.md).`,
    };
  }
  return { buffer: Buffer.from(await pdf.arrayBuffer()) };
}

/**
 * Create a course. Multipart form: title, summary, description, level,
 * priceUsd (dollars, e.g. "49.99"), pages, published, pdf (file). The PDF is
 * stored base64 in courseFiles/{id}, not the course doc.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    const summary = String(form.get("summary") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const level = String(form.get("level") ?? "Beginner");
    const priceUsd = Math.round(parseFloat(String(form.get("priceUsd") ?? "0")) * 100);
    const pages = parseInt(String(form.get("pages") ?? "0"), 10) || 0;
    const published = String(form.get("published")) === "true";

    if (title.length < 3) {
      return NextResponse.json({ error: "Title is too short." }, { status: 400 });
    }
    if (!LEVELS.includes(level)) {
      return NextResponse.json({ error: "Invalid level." }, { status: 400 });
    }
    if (!Number.isFinite(priceUsd) || priceUsd < 50) {
      return NextResponse.json(
        { error: "Price must be at least $0.50 (Stripe minimum)." },
        { status: 400 },
      );
    }
    const pdf = await readPdf(form.get("pdf"));
    if (pdf.error) return NextResponse.json({ error: pdf.error }, { status: 400 });

    const ref = adminDb().collection("courses").doc();
    await ref.set({
      id: ref.id,
      title,
      summary,
      description,
      level,
      priceUsd,
      pages,
      published,
      createdAt: Date.now(),
    });
    await adminDb().collection("courseFiles").doc(ref.id).set({
      data: pdf.buffer!.toString("base64"),
      contentType: "application/pdf",
      size: pdf.buffer!.length,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "unauthenticated" ? 401 : msg === "forbidden" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/** Update course fields (and optionally replace the PDF). Multipart form with id. */
export async function PATCH(req: Request) {
  try {
    await requireAdmin(req);
    const form = await req.formData();
    const id = String(form.get("id") ?? "");
    const ref = adminDb().collection("courses").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const patch: Record<string, unknown> = {};
    if (form.has("title")) patch.title = String(form.get("title")).trim();
    if (form.has("summary")) patch.summary = String(form.get("summary")).trim();
    if (form.has("description")) patch.description = String(form.get("description")).trim();
    if (form.has("level")) patch.level = String(form.get("level"));
    if (form.has("pages")) patch.pages = parseInt(String(form.get("pages")), 10) || 0;
    if (form.has("published")) patch.published = String(form.get("published")) === "true";
    if (form.has("priceUsd")) {
      const cents = Math.round(parseFloat(String(form.get("priceUsd"))) * 100);
      if (!Number.isFinite(cents) || cents < 50) {
        return NextResponse.json(
          { error: "Price must be at least $0.50 (Stripe minimum)." },
          { status: 400 },
        );
      }
      patch.priceUsd = cents;
    }

    // Replace the PDF only if a new file was supplied.
    const pdfEntry = form.get("pdf");
    if (pdfEntry instanceof File && pdfEntry.size > 0) {
      const pdf = await readPdf(pdfEntry);
      if (pdf.error) return NextResponse.json({ error: pdf.error }, { status: 400 });
      await adminDb().collection("courseFiles").doc(id).set({
        data: pdf.buffer!.toString("base64"),
        contentType: "application/pdf",
        size: pdf.buffer!.length,
        updatedAt: Date.now(),
      });
    }

    await ref.set(patch, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "unauthenticated" ? 401 : msg === "forbidden" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/** Delete a course and its stored PDF. Body: { id } */
export async function DELETE(req: Request) {
  try {
    await requireAdmin(req);
    const { id } = await req.json();
    const ref = adminDb().collection("courses").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    await adminDb().collection("courseFiles").doc(String(id)).delete();
    await ref.delete();

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "unauthenticated" ? 401 : msg === "forbidden" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
