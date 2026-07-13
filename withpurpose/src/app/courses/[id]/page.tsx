"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowLeft, FileText, Lock, BadgeCheck, CreditCard, BookOpen, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { authedJson } from "@/lib/api";
import { formatUsd, type Course } from "@/lib/site";
import { useAuth } from "@/context/auth";
import { usePurchases } from "@/hooks/use-courses";
import { Reveal } from "@/components/ui/reveal";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();
  const { owned } = usePurchases(user?.uid);
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(
      doc(db, "courses", id),
      (snap) => {
        const data = snap.exists() ? ({ ...(snap.data() as Course), id: snap.id } as Course) : null;
        setCourse(data && data.published ? data : null);
      },
      () => setCourse(null),
    );
  }, [id]);

  const isOwned = owned.has(id);

  const buy = async () => {
    setError("");
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${id}`)}`);
      return;
    }
    setBusy(true);
    try {
      const { url } = await authedJson<{ url: string }>("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      window.open(url, "_self");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  };

  if (course === undefined) {
    return (
      <div className="container-wp section-pad pt-36">
        <div className="surface h-80 animate-pulse" aria-hidden />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="container-wp section-pad pt-36 text-center">
        <h1 className="font-display text-3xl text-cream">Course not found</h1>
        <p className="mt-3 text-cream-soft">It may have been unpublished or removed.</p>
        <Link href="/courses" className="btn-ghost mt-8 inline-flex">
          <ArrowLeft className="size-4" aria-hidden /> Back to courses
        </Link>
      </div>
    );
  }

  const pending = profile?.status === "pending";
  const suspended = profile?.status === "suspended";

  return (
    <div className="section-pad pt-32">
      <div className="container-wp max-w-4xl">
        <Reveal kind="fade">
          <Link href="/courses" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300">
            <ArrowLeft className="size-4" aria-hidden /> All courses
          </Link>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Reveal kind="fade" as="span">
              <span className="kicker">{course.level}</span>
            </Reveal>
            <Reveal kind="blur" as="h2" delay={0.08}>
              <span className="font-display mt-3 block text-[clamp(1.9rem,4vw,3rem)] leading-tight tracking-wide text-cream">
                {course.title}
              </span>
            </Reveal>
            <Reveal kind="up" delay={0.15} as="p">
              <span className="mt-4 block text-lg leading-relaxed text-cream-soft">{course.summary}</span>
            </Reveal>

            <Reveal kind="up" delay={0.2}>
              <div className="mt-8 whitespace-pre-line text-[1rem] leading-[1.8] text-cream-soft">
                {course.description}
              </div>
            </Reveal>
          </div>

          {/* Buy box */}
          <Reveal kind="right" delay={0.15}>
            <aside className="surface sticky top-24 flex flex-col gap-5 p-7 shadow-(--shadow-lg)">
              <p className="font-display text-4xl text-gold-400 tabular">{formatUsd(course.priceUsd)}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-cream-soft">
                <li className="flex items-center gap-2">
                  <FileText className="size-4 text-gold-500" aria-hidden />
                  {course.pages > 0 ? `${course.pages}-page PDF course` : "PDF course"}
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="size-4 text-gold-500" aria-hidden />
                  Read online or download
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-4 text-gold-500" aria-hidden />
                  Lifetime access in your library
                </li>
              </ul>

              {isOwned ? (
                <Link href="/library" className="btn-chip w-full">
                  <BadgeCheck className="size-4" aria-hidden /> In your library — open it
                </Link>
              ) : suspended ? (
                <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-red-300">
                  Your account is suspended; purchasing is disabled.
                </p>
              ) : pending ? (
                <div className="flex flex-col gap-2">
                  <button type="button" disabled className="btn-chip w-full">
                    <Lock className="size-4" aria-hidden /> Awaiting approval
                  </button>
                  <p className="text-xs leading-relaxed text-cream-faint">
                    Our team is reviewing your account. Purchasing unlocks once
                    you&rsquo;re approved, usually within a day.
                  </p>
                </div>
              ) : (
                <button type="button" onClick={buy} disabled={busy} className="btn-chip w-full">
                  <CreditCard className="size-4" aria-hidden />
                  {busy ? "Opening checkout…" : user ? "Buy this course" : "Sign in to buy"}
                </button>
              )}

              {error && (
                <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <p className="border-t border-line-soft pt-4 text-xs leading-relaxed text-cream-faint">
                Payments are processed securely by Stripe. 14-day refund policy
                applies if material has not been accessed —{" "}
                <Link href="/refunds" className="text-gold-400 underline underline-offset-2">
                  details
                </Link>
                .
              </p>
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
