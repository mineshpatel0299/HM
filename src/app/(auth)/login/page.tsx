"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { scalePress } from "@/lib/motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    setIsSubmitting(false);
    if (result?.error) {
      setError("The email or password you entered is incorrect.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Email address
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
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
        <span>{isSubmitting ? "Signing in..." : "Sign in to Thread"}</span>
        <ArrowRight className="h-4 w-4" />
      </motion.button>

      <p className="mt-2 text-center font-sans text-xs text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-ember hover:underline underline-offset-4">
          Create a private account
        </Link>
      </p>
    </form>
  );
}
