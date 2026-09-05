"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { scalePress } from "@/lib/motion";
import { signup } from "../actions";
import { KeyRound, User, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

    const result = await signup(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="inviteCode" className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Invite code
        </label>
        <div className="relative">
          <input
            id="inviteCode"
            name="inviteCode"
            required
            autoComplete="off"
            placeholder="e.g. LOVE-1234"
            className="w-full rounded-2xl glass-input px-4 py-3 pl-11 font-sans text-sm text-ink placeholder:text-ink-muted/60 outline-none uppercase tracking-wider"
          />
          <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-ink-muted" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Your name
        </label>
        <div className="relative">
          <input
            id="displayName"
            name="displayName"
            required
            autoComplete="name"
            placeholder="e.g. Alex"
            className="w-full rounded-2xl glass-input px-4 py-3 pl-11 font-sans text-sm text-ink placeholder:text-ink-muted/60 outline-none"
          />
          <User className="absolute left-4 top-3.5 h-4 w-4 text-ink-muted" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Email address
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl glass-input px-4 py-3 pl-11 font-sans text-sm text-ink placeholder:text-ink-muted/60 outline-none"
          />
          <Mail className="absolute left-4 top-3.5 h-4 w-4 text-ink-muted" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="w-full rounded-2xl glass-input px-4 py-3 pl-11 font-sans text-sm text-ink placeholder:text-ink-muted/60 outline-none"
          />
          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-ink-muted" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 border border-rose-500/20 font-sans font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl gradient-btn px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-lg disabled:opacity-60"
      >
        <span>{isSubmitting ? "Creating account..." : "Create Account"}</span>
        <ArrowRight className="h-4 w-4" />
      </motion.button>

      <p className="mt-2 text-center font-sans text-xs text-ink-muted">
        Already have a space?{" "}
        <Link href="/login" className="font-semibold text-ember hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
