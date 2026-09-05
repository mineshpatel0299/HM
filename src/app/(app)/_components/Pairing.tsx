"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { fadeRise, scalePress, useReducedMotionSafe } from "@/lib/motion";
import { createSpace, joinSpace } from "../actions";
import { Heart, PlusCircle, LogIn, ArrowLeft, Copy, Check } from "lucide-react";

type View = "choice" | "create" | "created" | "join";

export function Pairing() {
  const router = useRouter();
  const [view, setView] = useState<View>("choice");
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  function handleCopy() {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center p-4">
      <div className="w-full rounded-3xl glass-card p-6 sm:p-8 border border-white/80 shadow-glass text-center">
        <AnimatePresence mode="wait" initial={false}>
          {view === "choice" && (
            <motion.div
              key="choice"
              variants={variants(fadeRise)}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex w-full flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/10 text-ember">
                  <Heart className="h-6 w-6 fill-ember/20" />
                </div>
                <h2 className="font-display text-2xl font-bold text-ink">Two Skies, One Thread</h2>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Start a private shared space for you and your partner, or join an existing thread.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  variants={scalePress}
                  initial="rest"
                  whileTap="tap"
                  onClick={() => goTo("create")}
                  className="flex items-center justify-center gap-2.5 rounded-2xl gradient-btn px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-md"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Create a New Space</span>
                </motion.button>

                <motion.button
                  variants={scalePress}
                  initial="rest"
                  whileTap="tap"
                  onClick={() => goTo("join")}
                  className="flex items-center justify-center gap-2.5 rounded-2xl bg-paper2/80 px-6 py-3.5 font-sans text-sm font-semibold text-ink border border-line hover:bg-paper2 transition-colors"
                >
                  <LogIn className="h-4.5 w-4.5 text-ink-muted" />
                  <span>Join with Invite Code</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {view === "create" && (
            <motion.div
              key="create"
              variants={variants(fadeRise)}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex w-full flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-ink">Create Your Space</h2>
                <p className="font-sans text-xs text-ink-muted">
                  We&apos;ll generate a unique code for your partner to join.
                </p>
              </div>

              {error && <p className="font-sans text-xs text-rose-600 font-medium">{error}</p>}

              <motion.button
                variants={scalePress}
                initial="rest"
                whileTap="tap"
                disabled={isPending}
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 rounded-2xl gradient-btn px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-md disabled:opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{isPending ? "Creating Space..." : "Generate Invite Code"}</span>
              </motion.button>

              <button
                type="button"
                onClick={() => goTo("choice")}
                className="flex items-center justify-center gap-1 font-sans text-xs text-ink-muted hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
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
              className="flex w-full flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-ink">Send This Code</h2>
                <p className="font-sans text-xs text-ink-muted">
                  Share this code with your partner so they can connect.
                </p>
              </div>

              <div className="relative flex items-center justify-between rounded-2xl bg-paper2/90 border border-ember/30 px-6 py-4">
                <span className="font-display text-3xl font-bold tracking-[0.25em] text-ember">
                  {inviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ember shadow-sm hover:scale-105 transition-transform"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <motion.button
                variants={scalePress}
                initial="rest"
                whileTap="tap"
                onClick={handleContinueToApp}
                className="rounded-2xl gradient-btn px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-md"
              >
                Continue to App
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
              className="flex w-full flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-ink">Join Their Space</h2>
                <p className="font-sans text-xs text-ink-muted">
                  Enter the invite code sent by your partner.
                </p>
              </div>

              <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
                <input
                  name="code"
                  placeholder="ENTER CODE"
                  required
                  className="rounded-2xl glass-input px-4 py-3.5 text-center font-display text-xl uppercase tracking-widest text-ink outline-none"
                />
                {error && <p className="font-sans text-xs text-rose-600 font-medium">{error}</p>}
                <motion.button
                  variants={scalePress}
                  initial="rest"
                  whileTap="tap"
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl gradient-btn px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-md disabled:opacity-60"
                >
                  {isPending ? "Connecting..." : "Join Space"}
                </motion.button>
              </form>

              <button
                type="button"
                onClick={() => goTo("choice")}
                className="flex items-center justify-center gap-1 font-sans text-xs text-ink-muted hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
