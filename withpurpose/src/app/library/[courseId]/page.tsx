"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { authedObjectUrl } from "@/lib/api";
import { useAuth } from "@/context/auth";

/** In-site PDF reader for a purchased course. */
export default function ReaderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?next=${encodeURIComponent(`/library/${courseId}`)}`);
      return;
    }
    if (!user) return;
    let objUrl: string | null = null;
    let cancelled = false;
    authedObjectUrl(`/api/download?courseId=${courseId}`)
      .then((u) => {
        objUrl = u;
        if (cancelled) URL.revokeObjectURL(u);
        else setUrl(u);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load."));
    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [user, courseId, router]);

  const download = async () => {
    const objUrl = await authedObjectUrl(`/api/download?courseId=${courseId}&mode=download`);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = "course.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
  };

  return (
    <div className="flex min-h-svh flex-col pt-20">
      <div className="container-wp flex items-center justify-between gap-4 py-4">
        <Link href="/library" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300">
          <ArrowLeft className="size-4" aria-hidden /> My Library
        </Link>
        <button type="button" onClick={download} className="btn-ghost px-4 py-2 text-sm">
          <Download className="size-4" aria-hidden /> Download PDF
        </button>
      </div>

      <div className="container-wp flex-1 pb-6">
        {error ? (
          <div className="surface grid h-[70vh] place-items-center p-8 text-center">
            <div>
              <p className="text-red-300">{error}</p>
              <Link href="/courses" className="btn-chip mt-6 inline-flex">
                Browse courses
              </Link>
            </div>
          </div>
        ) : url ? (
          <iframe
            src={url}
            title="Course PDF"
            className="h-[calc(100vh-9rem)] w-full rounded-2xl border border-line-soft bg-white"
          />
        ) : (
          <div className="surface h-[70vh] animate-pulse" aria-hidden />
        )}
      </div>
    </div>
  );
}
