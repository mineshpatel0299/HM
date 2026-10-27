"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Flower2,
  Heart,
  LockKeyhole,
  Radio,
  Feather,
  Camera,
} from "lucide-react";
import { PushNotifications } from "@/components/push/PushNotifications";

const littleThings = [
  {
    href: "/connect",
    title: "Send a little signal",
    description: "An ‘I’m thinking of you’, without a word.",
    icon: Radio,
    color: "bg-[#f4e7eb] text-ember",
  },
  {
    href: "/notes",
    title: "Put it into words",
    description: "Leave something lovely for them to find.",
    icon: Feather,
    color: "bg-[#f3ede2] text-amber",
  },
  {
    href: "/memories",
    title: "Keep this feeling",
    description: "A home for your favourite little moments.",
    icon: Camera,
    color: "bg-[#eaf0eb] text-sage",
  },
];

export function AppHome({
  children,
  myName,
  dateLabel,
}: {
  children: ReactNode;
  myName: string;
  dateLabel: string;
}) {
  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 text-ember">Your everyday, together</p>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-[40px]">
            A little closer, <em>{myName}.</em>
          </h1>
          <p className="mt-3 text-xs text-ink-muted sm:text-sm">
            A place for all the little things that make you, you two.
          </p>
        </div>
        <span className="hidden pb-1 text-[11px] text-ink-muted md:block">
          {dateLabel}
        </span>
      </header>
      <section className="relative overflow-hidden rounded-3xl bg-[#503342] px-6 py-8 text-[#fbf5f0] sm:px-9 sm:py-10">
        <div className="relative z-10 max-w-md">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] tracking-wide text-white/75">
            <LockKeyhole size={10} />A private world, just for two
          </span>
          <h2 className="font-display text-3xl font-normal leading-tight sm:text-[38px]">
            Two skies.
            <br />
            <em className="text-[#e7bac6]">Still under the same stars.</em>
          </h2>
          <p className="mt-4 max-w-sm text-xs leading-6 text-white/65">
            Different places, shared days. Keep showing up for each other in
            your own little ways.
          </p>
          <Link
            href="/connect"
            className="mt-6 inline-flex items-center gap-3 text-[11px] font-medium text-[#f1d4dd]"
          >
            Send some love <ArrowRight size={14} />
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 hidden h-[350px] w-[350px] -translate-y-1/2 items-center justify-center rounded-full border border-white/10 md:flex"
        >
          <div className="flex h-[270px] w-[270px] items-center justify-center rounded-full border border-white/10">
            <div className="flex h-[190px] w-[190px] items-center justify-center rounded-full border border-white/15">
              <Heart
                size={65}
                strokeWidth={0.7}
                className="-rotate-12 text-[#ddb1c1]"
              />
            </div>
          </div>
          <span className="absolute left-11 top-16 h-2 w-2 rounded-full bg-[#ddb1c1]" />
          <span className="absolute bottom-16 left-20 h-1.5 w-1.5 rounded-full bg-[#d5bf9c]" />
        </div>
      </section>
      <PushNotifications />
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Here, there & everywhere</p>
            <h2 className="font-display text-2xl">Our little connection</h2>
          </div>
          <span className="hidden items-center gap-1.5 text-[10px] text-ink-muted sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Made for the two of you
          </span>
        </div>
        {children}
      </section>
      <section>
        <div className="mb-5">
          <p className="eyebrow mb-2">Love, in the everyday</p>
          <h2 className="font-display text-2xl">The little things add up.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {littleThings.map(
            ({ href, title, description, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="premium-card glass-card-hover group p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon size={18} strokeWidth={1.4} />
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-ink-muted/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
                <h3 className="font-display text-lg">{title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                  {description}
                </p>
              </Link>
            ),
          )}
        </div>
      </section>
      <Link
        href="/cycle"
        className="group flex flex-wrap items-center gap-4 rounded-3xl border border-[#e6d7dd] bg-[#f1e6e9] px-6 py-6 sm:px-8"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/60 text-ember">
          <Flower2 size={23} strokeWidth={1.3} />
        </span>
        <div className="flex-1">
          <p className="eyebrow mb-1.5 text-ember">
            A little care for you · New
          </p>
          <h2 className="font-display text-xl text-emberDark">
            Your body has a rhythm, too.
          </h2>
          <p className="mt-1.5 text-[11px] text-emberDark/75">
            Track your period, notice your patterns, and make space for
            yourself.
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs font-medium text-emberDark">
          Explore tracker
          <ArrowUpRight size={15} />
        </span>
      </Link>
    </div>
  );
}
