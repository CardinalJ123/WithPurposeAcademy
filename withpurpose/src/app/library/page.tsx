"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { BookOpen, Download, PartyPopper, LibraryBig } from "lucide-react";
import { db } from "@/lib/firebase";
import { authedObjectUrl } from "@/lib/api";
import type { Purchase } from "@/lib/site";
import { useAuth } from "@/context/auth";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

function LibraryInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const justPurchased = params.get("purchased");

  useEffect(() => {
    if (user === null) router.replace("/login?next=/library");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "purchases"), where("uid", "==", user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Purchase)
          .sort((a, b) => b.createdAt - a.createdAt);
        setPurchases(list);
      },
      () => setPurchases([]),
    );
  }, [user]);

  const download = async (courseId: string, title: string) => {
    setDownloading(courseId);
    try {
      const objUrl = await authedObjectUrl(`/api/download?courseId=${courseId}&mode=download`);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${title.replace(/[^\w \-]/g, "").trim() || "course"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
    } catch {
      /* surfaced by button state reset */
    } finally {
      setDownloading(null);
    }
  };

  if (!user) return null;

  return (
    <div className="section-pad pt-32">
      <div className="container-wp">
        <Reveal kind="fade" as="span">
          <span className="kicker">My Library</span>
        </Reveal>
        <Reveal kind="blur" as="h2" delay={0.08}>
          <span className="font-display mt-3 block text-[clamp(2rem,4.5vw,3.2rem)] tracking-wide text-cream">
            Your course shelf
          </span>
        </Reveal>

        {justPurchased && (
          <p className="mt-8 flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-green-300">
            <PartyPopper className="size-4 shrink-0" aria-hidden />
            Payment received. Your course is unlocked below; it can take a few
            seconds to appear after checkout.
          </p>
        )}

        {/* Mount the reveal container only once purchases have loaded, so the
            one-shot reveal fires with the real cards present (not skeletons). */}
        {purchases === null ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="surface h-52 animate-pulse" aria-hidden />
            ))}
          </div>
        ) : purchases.length ? (
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {purchases.map((p) => (
              <RevealItem key={p.id} kind="up" as="article">
                <div className="surface flex h-full flex-col gap-4 p-7">
                  <span className="grid size-11 place-items-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400">
                    <BookOpen className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <h3 className="font-display flex-1 text-lg leading-snug tracking-wide text-cream">
                    {p.courseTitle}
                  </h3>
                  <p className="text-xs text-cream-faint">
                    Purchased {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 border-t border-line-soft pt-4">
                    <Link href={`/library/${p.courseId}`} className="btn-chip flex-1 px-4 py-2.5 text-sm">
                      <BookOpen className="size-4" aria-hidden /> Read
                    </Link>
                    <button
                      type="button"
                      onClick={() => download(p.courseId, p.courseTitle)}
                      disabled={downloading === p.courseId}
                      className="btn-ghost flex-1 px-4 py-2.5 text-sm"
                    >
                      <Download className="size-4" aria-hidden />
                      {downloading === p.courseId ? "Preparing…" : "Download"}
                    </button>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="surface mt-12 flex flex-col items-center gap-4 p-14 text-center">
            <LibraryBig className="size-10 text-cream-faint" aria-hidden />
            <p className="text-cream-soft">Your library is empty so far.</p>
            <Link href="/courses" className="btn-chip">
              Browse the catalogue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryInner />
    </Suspense>
  );
}
