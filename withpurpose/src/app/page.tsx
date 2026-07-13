"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, BookOpenCheck, Target, UserPlus, BadgeCheck, CreditCard, GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { CourseCard } from "@/components/course-card";
import { useCourses, usePurchases } from "@/hooks/use-courses";
import { useAuth } from "@/context/auth";
import { heroDelay } from "@/lib/boot";
import { site, img } from "@/lib/site";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const marqueeWords = [
  "Preflop Ranges",
  "Pot Odds",
  "Position",
  "Bankroll Discipline",
  "Hand Reading",
  "Mental Game",
  "GTO Foundations",
];

const pillars = [
  {
    icon: Target,
    title: "Strategy, not superstition",
    body: "Every course is built on the mathematics of the game: equity, odds, ranges, and expected value. No hunches, no folklore.",
  },
  {
    icon: BookOpenCheck,
    title: "Structured study paths",
    body: "Material is sequenced from fundamentals to advanced theory, so each concept builds on the one before it.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible by design",
    body: "We teach bankroll management and discipline first. Education only; we never host games or take wagers.",
  },
];

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up with Google or email. We ask for your NIC number to verify identity.",
  },
  {
    icon: BadgeCheck,
    title: "Get approved",
    body: "Our team reviews new accounts, usually within a day. You'll see your status on the site.",
  },
  {
    icon: CreditCard,
    title: "Buy a course",
    body: "Pay securely by card through Stripe. Your material unlocks the moment payment completes.",
  },
  {
    icon: GraduationCap,
    title: "Study anywhere",
    body: "Read in the built-in viewer or download the PDF from your library, on any device.",
  },
];

const faqs = [
  {
    q: "Is this gambling?",
    a: "No. With Purpose Academy sells educational PDFs about poker strategy. We do not operate games, accept wagers, or handle gambling funds in any way.",
  },
  {
    q: "Why do you need my NIC number?",
    a: "We verify each buyer's identity before enabling purchases. It keeps the platform accountable and is only used for verification, never shared.",
  },
  {
    q: "How do I receive the course after paying?",
    a: "Instantly. As soon as Stripe confirms your payment, the course appears in My Library where you can read it online or download the PDF.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, within 14 days of purchase if you have not accessed or downloaded the course material. See our Refund Policy for details.",
  },
  {
    q: "Do I need to be 18?",
    a: "Yes. Our content discusses real-money game strategy and is intended for adults aged 18 and over.",
  },
];

export default function HomePage() {
  const reduce = useReducedMotion();
  const T0 = heroDelay();
  const courses = useCourses();
  const { user } = useAuth();
  const { owned } = usePurchases(user?.uid);
  const featured = (courses ?? []).slice(0, 3);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative p-[clamp(0.6rem,1.6vw,1.4rem)]">
        <div aria-hidden className="hero-fog absolute inset-0" />
        <div className="relative flex min-h-[calc(100svh-2rem)] flex-col justify-center overflow-hidden rounded-[clamp(1.2rem,3vw,2.2rem)] border border-line-soft bg-(image:--grad-dark)">
          <div aria-hidden className="glow-gold absolute inset-x-0 top-0 h-1/2" />
          <div aria-hidden className="glow-red absolute inset-x-0 bottom-0 h-1/2" />
          {/* Giant faded suits */}
          <div aria-hidden className="font-display pointer-events-none absolute inset-0 overflow-hidden opacity-[0.05]">
            <span className="absolute -top-24 -left-10 text-[24rem]">♠</span>
            <span className="absolute right-0 bottom-0 text-[20rem]">♥</span>
          </div>

          <div className="container-wp relative grid items-center gap-10 py-[clamp(3rem,8vw,5.5rem)] lg:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col items-start gap-5">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: T0, ease: EASE }}
                className="kicker"
              >
                Poker education, done properly
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, delay: T0 + 0.12, ease: EASE }}
                className="font-display text-[clamp(2.6rem,6.5vw,4.8rem)] leading-[1.05] tracking-wide text-cream"
              >
                Study with discipline.
                <span className="block text-gold-400">Play with purpose.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: T0 + 0.3, ease: EASE }}
                className="max-w-lg text-[1.05rem] leading-relaxed text-cream-soft"
              >
                Professional poker course material that turns guesswork into
                strategy. Buy once, study forever, in your own library.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: T0 + 0.45, ease: EASE }}
                className="mt-2 flex flex-wrap gap-3"
              >
                <Link href="/courses" className="btn-chip">
                  Browse courses <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/login?mode=signup" className="btn-ghost">
                  Create an account
                </Link>
              </motion.div>
            </div>

            {/* Chip logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: reduce ? 0 : -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: T0 + 0.35, ease: EASE }}
              className="relative mx-auto hidden max-w-sm lg:block"
            >
              <div aria-hidden className="absolute -inset-8 rounded-full bg-gold-500/10 blur-3xl" />
              <Image
                src="/logo.webp"
                alt="With Purpose Academy poker chip emblem"
                width={520}
                height={520}
                priority
                className="relative w-full rounded-[2.5rem] object-cover shadow-(--shadow-lg)"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="wp-marquee overflow-hidden border-y border-line-soft bg-felt-900 py-3.5" aria-hidden>
        <div className="wp-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {marqueeWords.map((w) => (
                <span key={`${copy}-${w}`} className="flex items-center">
                  <span className="font-display px-6 text-lg tracking-wide text-cream-soft">{w}</span>
                  <span className="text-gold-500">♦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Pillars ── */}
      <section className="section-pad">
        <div className="container-wp">
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <Reveal kind="blur" as="h2" className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] tracking-wide text-cream">
              The house edge is <span className="text-gold-400">ignorance</span>. We remove it.
            </Reveal>
            <Reveal kind="right" className="hidden lg:block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line-soft">
                <Image
                  src={img.handChips}
                  alt="A king-ace starting hand next to stacked poker chips on a felt table"
                  fill
                  sizes="24rem"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
            {pillars.map((p) => (
              <RevealItem key={p.title} kind="up" as="article">
                <div className="surface flex h-full flex-col gap-4 p-7">
                  <span className="grid size-12 place-items-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400">
                    <p.icon className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <h3 className="font-display text-lg tracking-wide text-cream">{p.title}</h3>
                  <p className="text-[0.95rem] leading-relaxed text-cream-soft">{p.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Featured courses ── */}
      <section className="section-pad border-y border-line-soft bg-felt-900/50">
        <div className="container-wp">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal kind="fade" as="span">
                <span className="kicker">The material</span>
              </Reveal>
              <Reveal kind="blur" as="h2" delay={0.08}>
                <span className="font-display mt-3 block text-[clamp(1.8rem,3.6vw,2.6rem)] tracking-wide text-cream">
                  Featured courses
                </span>
              </Reveal>
            </div>
            <Reveal kind="fade" delay={0.15}>
              <Link href="/courses" className="btn-ghost">
                View all courses <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {courses === null ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="surface h-72 animate-pulse" aria-hidden />
              ))
            ) : featured.length ? (
              featured.map((c, i) => (
                <RevealItem key={c.id} kind="up" as="article">
                  <CourseCard course={c} index={i} owned={owned.has(c.id)} />
                </RevealItem>
              ))
            ) : (
              <p className="col-span-full text-cream-soft">
                Courses are being prepared. Check back soon.
              </p>
            )}
          </RevealGroup>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative section-pad overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <Image src={img.cardScatter} alt="" fill sizes="100vw" className="object-cover opacity-[0.07]" />
          <div className="absolute inset-0 bg-felt-950/40" />
        </div>
        <div className="container-wp relative">
          <Reveal kind="fade" as="span">
            <span className="kicker">How it works</span>
          </Reveal>
          <Reveal kind="blur" as="h2" delay={0.08}>
            <span className="font-display mt-3 block max-w-xl text-[clamp(1.8rem,3.6vw,2.6rem)] tracking-wide text-cream">
              From sign-up to study in four steps
            </span>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
            {steps.map((s, i) => (
              <RevealItem key={s.title} kind="up" as="article">
                <div className="surface relative flex h-full flex-col gap-4 p-7">
                  <span className="font-display absolute top-5 right-6 text-3xl text-felt-600 tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-12 place-items-center rounded-full border border-chip-500/30 bg-chip-500/10 text-chip-400">
                    <s.icon className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <h3 className="font-display text-lg tracking-wide text-cream">{s.title}</h3>
                  <p className="text-[0.95rem] leading-relaxed text-cream-soft">{s.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section-pad border-t border-line-soft bg-felt-900/50">
        <div className="container-wp grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Reveal kind="fade" as="span">
              <span className="kicker">FAQ</span>
            </Reveal>
            <Reveal kind="blur" as="h2" delay={0.08}>
              <span className="font-display mt-3 block text-[clamp(1.8rem,3.6vw,2.6rem)] tracking-wide text-cream">
                Straight answers
              </span>
            </Reveal>
            <Reveal kind="up" delay={0.15} as="p">
              <span className="mt-4 block text-cream-soft">
                Anything else? Email us at{" "}
                <a href={`mailto:${site.email}`} className="text-gold-400 underline underline-offset-2">
                  {site.email}
                </a>
                .
              </span>
            </Reveal>
          </div>

          <RevealGroup className="flex flex-col gap-3" stagger={0.07}>
            {faqs.map((f) => (
              <RevealItem key={f.q} kind="up">
                <details className="surface group p-5 open:shadow-(--shadow-md)">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-cream">
                    {f.q}
                    <span className="text-gold-500 transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-cream-soft">{f.a}</p>
                </details>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad">
        <div className="container-wp">
          <Reveal kind="scale">
            <div className="relative overflow-hidden rounded-[2rem] border border-gold-500/20 p-[clamp(2rem,6vw,4rem)] text-center">
              <div aria-hidden className="absolute inset-0">
                <Image src={img.chipPile} alt="" fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-felt-950/86" />
              </div>
              <div aria-hidden className="glow-gold absolute inset-x-0 top-0 h-full" />
              <h2 className="font-display relative mx-auto max-w-2xl text-[clamp(1.7rem,3.5vw,2.6rem)] tracking-wide text-cream">
                Ready to stop guessing at the table?
              </h2>
              <p className="relative mx-auto mt-3 max-w-xl text-cream-soft">
                Create your account, get verified, and start studying today.
              </p>
              <div className="relative mt-7 flex justify-center gap-3">
                <Link href="/login?mode=signup" className="btn-chip">
                  Join the Academy <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
