"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeRise, useReducedMotionSafe } from "@/lib/motion";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { PushNotifications } from "@/components/push/PushNotifications";

// Hero is an async Server Component (it fetches status/weather itself), so
// it can't be imported here directly — this file needs "use client" for
// framer-motion. The page renders <Hero /> and passes it in as children.
export function AppHome({ children }: { children: ReactNode }) {
  const { variants } = useReducedMotionSafe();

  return (
    <motion.div
      variants={variants(fadeRise)}
      initial="hidden"
      animate="visible"
      className="mx-auto flex w-full max-w-xl flex-col gap-8"
    >
      <header className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/70">you&apos;re both here now</p>
        <h1 className="font-display text-3xl">two skies, one thread</h1>
      </header>

      <PushNotifications />

      <SectionDivider />

      {children}

      <div className="flex flex-wrap gap-4">
        <Link
          href="/connect"
          className="self-start font-sans text-sm text-ink underline underline-offset-4"
        >
          connection signals
        </Link>
        <Link
          href="/play"
          className="self-start font-sans text-sm text-ink underline underline-offset-4"
        >
          spark &amp; games
        </Link>
        <Link
          href="/rhythm"
          className="self-start font-sans text-sm text-ink underline underline-offset-4"
        >
          daily rhythm
        </Link>
        <Link
          href="/memories"
          className="self-start font-sans text-sm text-ink underline underline-offset-4"
        >
          memories
        </Link>
        <Link
          href="/notes"
          className="self-start font-sans text-sm text-ink underline underline-offset-4"
        >
          notes
        </Link>
      </div>
    </motion.div>
  );
}
