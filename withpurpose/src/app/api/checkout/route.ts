import { NextResponse } from "next/server";
import { adminDb, requireUser } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import { site } from "@/lib/site";

/** Creates a Stripe Checkout Session for one course. */
export async function POST(req: Request) {
  try {
    const { decoded, userDoc } = await requireUser(req);
    if (!userDoc) {
      return NextResponse.json(
        { error: "Your profile is still being set up. Please try again in a moment." },
        { status: 403 },
      );
    }
    if (userDoc.status !== "approved") {
      return NextResponse.json(
        { error: "Your account is awaiting approval by our team." },
        { status: 403 },
      );
    }

    const { courseId } = await req.json();
    const courseSnap = await adminDb().collection("courses").doc(String(courseId)).get();
    if (!courseSnap.exists || !courseSnap.data()!.published) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }
    const course = courseSnap.data()!;

    // Already owned?
    const owned = await adminDb()
      .collection("purchases")
      .where("uid", "==", decoded.uid)
      .where("courseId", "==", courseSnap.id)
      .limit(1)
      .get();
    if (!owned.empty) {
      return NextResponse.json({ error: "You already own this course." }, { status: 409 });
    }

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: decoded.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: course.priceUsd,
            product_data: {
              name: course.title,
              description: course.summary,
            },
          },
        },
      ],
      metadata: { uid: decoded.uid, courseId: courseSnap.id },
      success_url: `${site.url}/library?purchased=${courseSnap.id}`,
      cancel_url: `${site.url}/courses/${courseSnap.id}?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "unauthenticated" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
