"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { scalePress } from "@/lib/motion";
import { signup } from "../actions";

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
      <div className="flex flex-col gap-1">
        <label htmlFor="displayName" className="font-sans text-xs text-ink/70">
          your name
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          autoComplete="name"
          className="rounded-xl border border-line bg-paper px-4 py-3 font-sans text-sm text-ink outline-none focus:border-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-sans text-xs text-ink/70">
          email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-line bg-paper px-4 py-3 font-sans text-sm text-ink outline-none focus:border-ember"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-sans text-xs text-ink/70">
          password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        {isSubmitting ? "creating account…" : "create account"}
      </motion.button>
      <p className="text-center font-sans text-xs text-ink/70">
        already have a space?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          sign in
        </Link>
      </p>
    </form>
  );
}
