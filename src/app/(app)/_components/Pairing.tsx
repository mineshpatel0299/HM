"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { fadeRise, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { createSpace, joinSpace } from "../actions";

type View = "choice" | "create" | "created" | "join";

export function Pairing() {
  const router = useRouter();
  const [view, setView] = useState<View>("choice");
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { variants } = useReducedMotionSafe();

  function goTo(next: View) {
    setError(null);
    setView(next);
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createSpace();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInviteCode(result.inviteCode);
      setView("created");
    });
  }

  function handleContinueToApp() {
    router.refresh();
  }

  function handleJoinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    startTransition(async () => {
      const result = await joinSpace(code);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <AnimatePresence mode="wait" initial={false}>
        {view === "choice" && (
          <motion.div
            key="choice"
            variants={variants(fadeRise)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex w-full flex-col gap-4"
          >
            <h2 className="font-display text-2xl">two skies, one thread</h2>
            <p className="font-sans text-sm text-ink/70">
              start a shared space, or join the one waiting for you.
            </p>
            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              onClick={() => goTo("create")}
              className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper"
            >
              create a space
            </motion.button>
            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              onClick={() => goTo("join")}
              className="rounded-2xl border border-line px-5 py-3 font-sans text-sm text-ink"
            >
              join with a code
            </motion.button>
          </motion.div>
        )}

        {view === "create" && (
          <motion.div
            key="create"
            variants={variants(fadeRise)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex w-full flex-col gap-4"
          >
            <h2 className="font-display text-2xl">create your space</h2>
            <p className="font-sans text-sm text-ink/70">
              you&apos;ll get a code to send your partner.
            </p>
            {error && <p className="font-sans text-sm text-emberDark">{error}</p>}
            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              disabled={isPending}
              onClick={handleCreate}
              className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
            >
              {isPending ? "creating…" : "create"}
            </motion.button>
            <button
              type="button"
              onClick={() => goTo("choice")}
              className="font-sans text-xs text-ink/70 underline underline-offset-4"
            >
              back
            </button>
          </motion.div>
        )}

        {view === "created" && inviteCode && (
          <motion.div
            key="created"
            variants={variants(fadeRise)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex w-full flex-col gap-4"
          >
            <h2 className="font-display text-2xl">send them this</h2>
            <p className="font-sans text-sm text-ink/70">
              they&apos;ll enter it under &ldquo;join with a code&rdquo;.
            </p>
            <p className="rounded-2xl border border-dashed border-line bg-paper px-5 py-4 font-display text-3xl tracking-[0.3em] text-ink">
              {inviteCode}
            </p>
            <motion.button
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              onClick={handleContinueToApp}
              className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper"
            >
              I&apos;ve sent it
            </motion.button>
          </motion.div>
        )}

        {view === "join" && (
          <motion.div
            key="join"
            variants={variants(fadeRise)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex w-full flex-col gap-4"
          >
            <h2 className="font-display text-2xl">join their space</h2>
            <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3">
              <input
                name="code"
                placeholder="invite code"
                required
                className="rounded-xl border border-line bg-paper px-4 py-3 text-center font-sans text-sm uppercase tracking-widest text-ink outline-none focus:border-ember"
              />
              {error && <p className="font-sans text-sm text-emberDark">{error}</p>}
              <motion.button
                variants={scalePress}
                initial="rest"
                whileTap="tap"
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
              >
                {isPending ? "joining…" : "join"}
              </motion.button>
            </form>
            <button
              type="button"
              onClick={() => goTo("choice")}
              className="font-sans text-xs text-ink/70 underline underline-offset-4"
            >
              back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
