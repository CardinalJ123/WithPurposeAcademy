"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { CourseCard } from "@/components/course-card";
import { useCourses, usePurchases } from "@/hooks/use-courses";
import { useAuth } from "@/context/auth";

export default function CoursesPage() {
  const courses = useCourses();
  const { user, profile } = useAuth();
  const { owned } = usePurchases(user?.uid);

  return (
    <div className="section-pad pt-32">
      <div className="container-wp">
        <Reveal kind="fade" as="span">
          <span className="kicker">Course catalogue</span>
        </Reveal>
        <Reveal kind="blur" as="h2" delay={0.08}>
          <span className="font-display mt-3 block text-[clamp(2rem,4.5vw,3.2rem)] tracking-wide text-cream">
            Every course. One library.
          </span>
        </Reveal>
        <Reveal kind="up" delay={0.15} as="p">
          <span className="mt-4 block max-w-xl text-cream-soft">
            Buy a course once and it stays in your library forever, readable
            online or as a downloadable PDF.
          </span>
        </Reveal>

        {profile && profile.status === "pending" && (
          <p className="mt-8 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
            Your account is awaiting approval. You can browse the catalogue now;
            purchasing unlocks once our team verifies your details, usually
            within a day.
          </p>
        )}
        {profile && profile.status === "suspended" && (
          <p className="mt-8 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-300">
            Your account has been suspended. Contact support if you believe
            this is a mistake.
          </p>
        )}

        {/* Mount the reveal container only once courses have loaded — a
            RevealGroup with `once` fires its animation a single time, so if
            it mounts while showing skeletons the real cards (added later)
            would never be told to appear and stay invisible. */}
        {courses === null ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="surface h-72 animate-pulse" aria-hidden />
            ))}
          </div>
        ) : courses.length ? (
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {courses.map((c, i) => (
              <RevealItem key={c.id} kind="up" as="article">
                <CourseCard course={c} index={i} owned={owned.has(c.id)} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="mt-12 text-cream-soft">Courses are being prepared. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
