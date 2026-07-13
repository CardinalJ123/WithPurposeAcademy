"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authedJson } from "@/lib/api";
import { isValidNic } from "@/lib/validate";
import { useAuth } from "@/context/auth";
import { GoogleButton } from "@/components/google-button";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

function friendly(code: string) {
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "Incorrect email or password.";
  if (code.includes("user-not-found")) return "No account found with that email.";
  if (code.includes("email-already-in-use"))
    return "An account with this email already exists. Try signing in.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("popup-closed")) return "Google sign-in was cancelled.";
  if (code.includes("unauthorized-domain"))
    return "This site's domain isn't authorized in Firebase yet. In Firebase Console, go to Authentication → Settings → Authorized domains and add this domain.";
  if (code.includes("operation-not-allowed"))
    return "This sign-in method isn't enabled yet. In Firebase Console, go to Authentication → Sign-in method and enable it.";
  if (code.includes("api-key-not-valid") || code.includes("invalid-api-key"))
    return "Firebase isn't configured correctly (invalid API key). Check the NEXT_PUBLIC_FIREBASE_* environment variables.";
  // Unrecognized error: surface the raw Firebase code instead of a generic
  // message, so this doesn't need a devtools trip to diagnose next time.
  const match = code.match(/auth\/[a-z-]+/);
  return match ? `Something went wrong (${match[0]}). Please try again.` : "Something went wrong. Please try again.";
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, needsProfile, profileLoaded } = useAuth();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const next = params.get("next") || "/courses";

  // Already signed in? Route forward (or to the NIC step).
  useEffect(() => {
    if (user && profileLoaded) {
      router.replace(needsProfile ? `/complete-profile?next=${encodeURIComponent(next)}` : next);
    }
  }, [user, profileLoaded, needsProfile, router, next]);

  const google = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirect happens in the effect once the profile snapshot loads.
    } catch (e) {
      setError(friendly(String(e)));
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (name.trim().length < 2) return setError("Please enter your full name.");
      if (!isValidNic(nic))
        return setError("Please enter a valid NIC number (9 digits + V/X, or 12 digits).");
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await authedJson("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), nic }),
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // Effect redirects.
    } catch (e) {
      setError(friendly(String(e)));
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center px-4 py-28">
      <div aria-hidden className="glow-gold pointer-events-none absolute inset-x-0 top-0 h-1/2" />

      <div className="surface relative w-full max-w-md p-8 shadow-(--shadow-lg)">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image src="/logo.webp" alt="" width={120} height={120} className="size-16 rounded-2xl object-cover" />
          <h1 className="font-display text-2xl tracking-wide">
            {mode === "signin" ? "Welcome back" : "Join the Academy"}
          </h1>
          <p className="text-sm text-cream-soft">
            {mode === "signin"
              ? "Sign in to access your course library."
              : "Create an account to purchase and study our courses."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-pill border border-line p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={cn(
                "rounded-pill py-2 text-sm font-semibold transition-colors",
                mode === m ? "bg-(image:--grad-chip) text-white" : "text-cream-soft hover:text-white",
              )}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <GoogleButton onClick={google} disabled={busy} />

        <div className="my-5 flex items-center gap-3 text-xs tracking-widest text-cream-faint uppercase">
          <span className="h-px flex-1 bg-line-soft" />
          or with email
          <span className="h-px flex-1 bg-line-soft" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {mode === "signup" && (
            <>
              <div>
                <label htmlFor="lg-name" className="mb-1 block text-sm font-medium text-cream-soft">
                  Full name
                </label>
                <input
                  id="lg-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field"
                  placeholder="As it appears on your NIC"
                />
              </div>
              <div>
                <label htmlFor="lg-nic" className="mb-1 block text-sm font-medium text-cream-soft">
                  NIC number
                </label>
                <input
                  id="lg-nic"
                  type="text"
                  required
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="field"
                  placeholder="e.g. 923456789V or 199234567890"
                />
                <p className="mt-1 text-xs text-cream-faint">
                  Used to verify your identity before purchases are enabled.
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="lg-email" className="mb-1 block text-sm font-medium text-cream-soft">
              Email
            </label>
            <input
              id="lg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="lg-pass" className="mb-1 block text-sm font-medium text-cream-soft">
              Password
            </label>
            <input
              id="lg-pass"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-chip mt-1 w-full">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-cream-faint">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-gold-400 underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gold-400 underline underline-offset-2">
            Privacy Policy
          </Link>
          . New accounts are reviewed by our team before purchases are enabled.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
