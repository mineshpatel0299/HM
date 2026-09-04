"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { scalePress } from "@/lib/motion";

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
      setError("that email and password don't match.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-sans text-xs text-ink/70">
          email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-line bg-paper px-4 py-3 font-sans text-sm text-ink outline-none focus:border-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-sans text-xs text-ink/70">
          password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-line bg-paper px-4 py-3 font-sans text-sm text-ink outline-none focus:border-ember"
        />
      </div>
      {error && <p className="font-sans text-sm text-emberDark">{error}</p>}
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
      >
        {isSubmitting ? "signing in…" : "sign in"}
      </motion.button>
      <p className="text-center font-sans text-xs text-ink/70">
        new here?{" "}
        <Link href="/signup" className="text-ink underline underline-offset-4">
          create an account
        </Link>
      </p>
    </form>
  );
}
