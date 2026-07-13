"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LibraryBig, ShieldCheck, LogOut, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Dark tab hanging from the top edge: logo left, links, account controls. */
export function SiteHeader() {
  const pathname = usePathname();
  const { user, profile, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : href.startsWith("/#") ? false : pathname.startsWith(href);

  const setMenu = (next: boolean) => {
    setOpen(next);
    document.documentElement.style.overflow = next ? "hidden" : "";
  };

  const accountLinks = user
    ? [
        { href: "/library", label: "My Library", icon: LibraryBig },
        ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
      ]
    : [];

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.9, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[600] flex justify-center max-lg:px-3"
      >
        <div className="flex w-full max-w-fit items-center gap-1 rounded-b-2xl border border-t-0 border-white/10 bg-felt-950/90 py-1.5 pr-2 pl-4 shadow-(--shadow-lg) backdrop-blur-xl max-lg:w-full max-lg:max-w-none max-lg:justify-between">
          <Link href="/" aria-label="With Purpose Academy home" className="flex items-center gap-2.5 py-0.5 pr-2">
            <Image
              src="/logo.webp"
              alt=""
              width={72}
              height={72}
              priority
              className="size-9 rounded-lg object-cover"
            />
            <span className="font-display text-[0.98rem] leading-tight tracking-wide text-cream">
              With Purpose
              <span className="block text-[0.6rem] font-bold tracking-[0.3em] text-gold-500 uppercase">
                Academy
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="ml-4 flex items-center">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative block rounded-lg px-3.5 py-2 text-[0.9rem] font-medium whitespace-nowrap transition-colors duration-300",
                      isActive(item.href)
                        ? "text-white"
                        : "text-cream-soft hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span
                        aria-hidden
                        className="absolute inset-x-3.5 bottom-0.5 h-0.5 rounded-full bg-(image:--grad-gold)"
                      />
                    )}
                  </Link>
                </li>
              ))}
              {accountLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.9rem] font-medium whitespace-nowrap transition-colors duration-300",
                      isActive(item.href)
                        ? "text-gold-400"
                        : "text-gold-500 hover:bg-white/5 hover:text-gold-400",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 pl-2 lg:flex">
            {user === undefined ? null : user ? (
              <>
                <span className="max-w-36 truncate text-sm text-cream-faint" title={profile?.name ?? ""}>
                  {profile?.name ?? user.email}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  aria-label="Sign out"
                  className="grid size-9 place-items-center rounded-lg text-cream-soft transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="size-4" aria-hidden />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-pill bg-(image:--grad-chip) px-5 py-2 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              >
                <UserRound className="size-4" aria-hidden />
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenu(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            // data-lenis-prevent + overflow-y-auto so the menu scrolls on
            // short/landscape screens instead of Lenis trapping it; min-h-full
            // + justify-center keeps it centred when it fits.
            data-lenis-prevent
            className="fixed inset-0 z-[590] overflow-y-auto overscroll-contain bg-felt-950/97 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex min-h-full flex-col justify-center px-8 py-24">
              <ul className="flex flex-col gap-1.5">
                {[...nav, ...accountLinks].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 + i * 0.05, ease: EASE }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenu(false)}
                      className={cn(
                        "font-display block py-2 text-3xl tracking-wide transition-colors",
                        isActive(item.href) ? "text-gold-400" : "text-cream hover:text-gold-300",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
                  className="mt-6"
                >
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        logout();
                      }}
                      className="btn-ghost"
                    >
                      <LogOut className="size-4" aria-hidden /> Sign out
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setMenu(false)} className="btn-chip">
                      <UserRound className="size-4" aria-hidden /> Sign in
                    </Link>
                  )}
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
