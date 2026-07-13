"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Users, BookOpen, DollarSign, Clock, BadgeCheck, Ban, RotateCcw,
  Plus, Pencil, Trash2, X, ShieldCheck,
} from "lucide-react";
import { authedFetch, authedJson } from "@/lib/api";
import { formatUsd, type Course, type Purchase, type UserDoc } from "@/lib/site";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

type Overview = {
  users: UserDoc[];
  courses: Course[];
  purchases: Purchase[];
  stats: {
    totalUsers: number;
    pendingUsers: number;
    approvedUsers: number;
    totalSales: number;
    revenue: number;
    publishedCourses: number;
  };
};

type Tab = "overview" | "users" | "courses";

const emptyForm = {
  id: "",
  title: "",
  summary: "",
  description: "",
  level: "Beginner",
  priceUsd: "",
  pages: "",
  published: true,
};

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, profileLoaded, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  // Course form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await authedJson<Overview>("/api/admin/overview");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    }
  }, []);

  useEffect(() => {
    if (user === null) router.replace("/login?next=/admin");
    if (user && profileLoaded && !isAdmin) router.replace("/");
  }, [user, profileLoaded, isAdmin, router]);

  useEffect(() => {
    if (!(user && isAdmin)) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [user, isAdmin, load]);

  const setUserStatus = async (uid: string, action: "approve" | "suspend" | "pending") => {
    setBusyId(uid);
    try {
      await authedJson("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId("");
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setPdfFile(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (c: Course) => {
    setForm({
      id: c.id,
      title: c.title,
      summary: c.summary,
      description: c.description,
      level: c.level,
      priceUsd: (c.priceUsd / 100).toFixed(2),
      pages: String(c.pages || ""),
      published: c.published,
    });
    setPdfFile(null);
    setFormError("");
    setShowForm(true);
  };

  const saveCourse = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.id && !pdfFile) {
      setFormError("Attach the course PDF.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      if (form.id) fd.set("id", form.id);
      fd.set("title", form.title);
      fd.set("summary", form.summary);
      fd.set("description", form.description);
      fd.set("level", form.level);
      fd.set("priceUsd", form.priceUsd);
      fd.set("pages", form.pages || "0");
      fd.set("published", String(form.published));
      if (pdfFile) fd.set("pdf", pdfFile);

      const res = await authedFetch("/api/admin/courses", {
        method: form.id ? "PATCH" : "POST",
        body: fd,
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error ?? "Save failed.");
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (c: Course) => {
    if (!confirm(`Delete "${c.title}"? Buyers keep nothing; this cannot be undone.`)) return;
    setBusyId(c.id);
    try {
      await authedJson("/api/admin/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusyId("");
    }
  };

  if (!user || !profileLoaded) {
    return (
      <div className="container-wp section-pad pt-36">
        <div className="surface h-72 animate-pulse" aria-hidden />
      </div>
    );
  }
  if (!isAdmin) return null;

  const stats = data?.stats;
  const statCards = [
    { icon: Users, label: "Total users", value: stats?.totalUsers ?? "–" },
    { icon: Clock, label: "Pending approval", value: stats?.pendingUsers ?? "–" },
    { icon: BookOpen, label: "Published courses", value: stats?.publishedCourses ?? "–" },
    { icon: DollarSign, label: "Revenue", value: stats ? formatUsd(stats.revenue) : "–" },
  ];

  return (
    <div className="section-pad pt-32">
      <div className="container-wp">
        <span className="kicker">
          <ShieldCheck className="size-4" aria-hidden /> Admin panel
        </span>
        <h1 className="font-display mt-3 text-[clamp(1.9rem,4vw,2.8rem)] tracking-wide text-cream">
          Welcome, {profile?.name?.split(" ")[0] ?? "Admin"}
        </h1>

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-pill border border-line p-1 sm:max-w-md">
          {(["overview", "users", "courses"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-pill py-2 text-sm font-semibold capitalize transition-colors",
                tab === t ? "bg-(image:--grad-chip) text-white" : "text-cream-soft hover:text-white",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((s) => (
                <div key={s.label} className="surface flex items-center gap-4 p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400">
                    <s.icon className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-wide text-cream-faint uppercase">{s.label}</p>
                    <p className="font-display text-2xl text-cream tabular">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="font-display mt-12 text-xl tracking-wide text-cream">Recent sales</h2>
            <div className="surface mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-xs tracking-wide text-cream-faint uppercase">
                    <th className="px-5 py-3.5 font-semibold">Course</th>
                    <th className="px-5 py-3.5 font-semibold">Buyer</th>
                    <th className="px-5 py-3.5 font-semibold">Amount</th>
                    <th className="px-5 py-3.5 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.purchases ?? []).slice(0, 15).map((p) => {
                    const buyer = data?.users.find((u) => u.uid === p.uid);
                    return (
                      <tr key={p.id} className="border-b border-line-soft/50 last:border-0">
                        <td className="px-5 py-3 text-cream">{p.courseTitle}</td>
                        <td className="px-5 py-3 text-cream-soft">{buyer?.email ?? p.uid}</td>
                        <td className="px-5 py-3 text-gold-400 tabular">{formatUsd(p.amount)}</td>
                        <td className="px-5 py-3 text-cream-faint">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {data && data.purchases.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-cream-faint">
                        No sales yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Users ── */}
        {tab === "users" && (
          <div className="surface mt-8 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line-soft text-xs tracking-wide text-cream-faint uppercase">
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.users ?? []).map((u) => (
                  <tr key={u.uid} className="border-b border-line-soft/50 last:border-0">
                    <td className="px-5 py-3 text-cream">
                      {u.name} {u.role === "admin" && <span className="text-xs text-gold-400">(admin)</span>}
                    </td>
                    <td className="px-5 py-3 text-cream-soft">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-pill border px-2.5 py-0.5 text-xs font-bold",
                          u.status === "approved" && "border-success/40 bg-success/10 text-success",
                          u.status === "pending" && "border-gold-500/40 bg-gold-500/10 text-gold-400",
                          u.status === "suspended" && "border-danger/40 bg-danger/10 text-red-300",
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {u.status !== "approved" && (
                          <button
                            type="button"
                            disabled={busyId === u.uid}
                            onClick={() => setUserStatus(u.uid, "approve")}
                            className="inline-flex items-center gap-1 rounded-pill border border-success/40 px-3 py-1 text-xs font-semibold text-success transition-colors hover:bg-success/10"
                          >
                            <BadgeCheck className="size-3.5" aria-hidden /> Approve
                          </button>
                        )}
                        {u.status !== "suspended" && u.role !== "admin" && (
                          <button
                            type="button"
                            disabled={busyId === u.uid}
                            onClick={() => setUserStatus(u.uid, "suspend")}
                            className="inline-flex items-center gap-1 rounded-pill border border-danger/40 px-3 py-1 text-xs font-semibold text-red-300 transition-colors hover:bg-danger/10"
                          >
                            <Ban className="size-3.5" aria-hidden /> Suspend
                          </button>
                        )}
                        {u.status === "suspended" && (
                          <button
                            type="button"
                            disabled={busyId === u.uid}
                            onClick={() => setUserStatus(u.uid, "pending")}
                            className="inline-flex items-center gap-1 rounded-pill border border-line px-3 py-1 text-xs font-semibold text-cream-soft transition-colors hover:bg-white/5"
                          >
                            <RotateCcw className="size-3.5" aria-hidden /> Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data && data.users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-cream-faint">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Courses ── */}
        {tab === "courses" && (
          <>
            <div className="mt-8 flex justify-end">
              <button type="button" onClick={openCreate} className="btn-chip px-5 py-2.5 text-sm">
                <Plus className="size-4" aria-hidden /> New course
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {(data?.courses ?? []).map((c) => (
                <div key={c.id} className="surface flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-48 flex-1">
                    <p className="font-display text-lg tracking-wide text-cream">{c.title}</p>
                    <p className="text-sm text-cream-faint">
                      {c.level} · {formatUsd(c.priceUsd)} ·{" "}
                      <span className={c.published ? "text-success" : "text-gold-400"}>
                        {c.published ? "Published" : "Draft"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(c)} className="btn-ghost px-4 py-2 text-sm">
                      <Pencil className="size-4" aria-hidden /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => deleteCourse(c)}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-danger/40 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-danger/10"
                    >
                      <Trash2 className="size-4" aria-hidden /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {data && data.courses.length === 0 && (
                <p className="surface p-8 text-center text-cream-faint">
                  No courses yet. Create your first one.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Course form modal ── */}
      {showForm && (
        // data-lenis-prevent: the global Lenis smooth-scroll otherwise
        // hijacks the wheel and this fixed overlay never scrolls, trapping
        // the taller form (and its submit button) off-screen.
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[700] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 p-4 pt-16 backdrop-blur-sm"
        >
          <div className="surface my-auto w-full max-w-lg p-7 shadow-(--shadow-lg)">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide text-cream">
                {form.id ? "Edit course" : "New course"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-lg text-cream-soft hover:bg-white/10"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form onSubmit={saveCourse} className="flex flex-col gap-3.5">
              <div>
                <label htmlFor="cf-title" className="mb-1 block text-sm font-medium text-cream-soft">Title</label>
                <input id="cf-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="field" />
              </div>
              <div>
                <label htmlFor="cf-summary" className="mb-1 block text-sm font-medium text-cream-soft">Short summary</label>
                <input id="cf-summary" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="field" placeholder="One or two sentences shown on the card" />
              </div>
              <div>
                <label htmlFor="cf-desc" className="mb-1 block text-sm font-medium text-cream-soft">Full description</label>
                <textarea id="cf-desc" required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field resize-y" placeholder="Shown on the course page. Blank lines become paragraphs." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="cf-level" className="mb-1 block text-sm font-medium text-cream-soft">Level</label>
                  <select id="cf-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="field">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cf-price" className="mb-1 block text-sm font-medium text-cream-soft">Price (USD)</label>
                  <input id="cf-price" required type="number" min="0.5" step="0.01" value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} className="field" placeholder="49.99" />
                </div>
                <div>
                  <label htmlFor="cf-pages" className="mb-1 block text-sm font-medium text-cream-soft">Pages</label>
                  <input id="cf-pages" type="number" min="0" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} className="field" placeholder="24" />
                </div>
              </div>
              <div>
                <label htmlFor="cf-pdf" className="mb-1 block text-sm font-medium text-cream-soft">
                  Course PDF {form.id && <span className="text-cream-faint">(leave empty to keep current)</span>}
                </label>
                <input
                  id="cf-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="field file:mr-3 file:rounded-pill file:border-0 file:bg-chip-600 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                />
                <p className="mt-1 text-xs text-cream-faint">
                  Stored in the database. Max 700&nbsp;KB per PDF for now.
                </p>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-cream-soft">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="size-4 accent-[oklch(54%_0.2_28)]"
                />
                Published (visible in the catalogue)
              </label>

              {formError && (
                <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-300">
                  {formError}
                </p>
              )}

              <button type="submit" disabled={saving} className="btn-chip mt-1 w-full">
                {saving ? "Saving…" : form.id ? "Save changes" : "Create course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
