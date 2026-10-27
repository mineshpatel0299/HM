"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Radio,
  Gamepad2,
  Moon,
  Camera,
  Feather,
  Flower2,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Our space", icon: Heart },
  { href: "/connect", label: "Signals", icon: Radio },
  { href: "/play", label: "Play & discover", icon: Gamepad2 },
  { href: "/rhythm", label: "Daily rhythm", icon: Moon },
  { href: "/cycle", label: "Period tracker", icon: Flower2 },
  { href: "/memories", label: "Memories", icon: Camera },
  { href: "/notes", label: "Love notes", icon: Feather },
];

export function Navbar({
  partnerName,
  myName,
}: {
  partnerName?: string | null;
  myName?: string;
}) {
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col overflow-y-auto border-r border-line bg-[#fcfbf9] p-6 lg:flex">
        <Link href="/" className="flex items-center gap-3 pt-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emberDark text-white">
            <Heart size={20} strokeWidth={1.5} />
          </span>
          <div>
            <span className="font-display text-xl tracking-tight">
              Humin<span className="text-ember">.</span>
            </span>
            <p className="mt-0.5 text-[9px] uppercase tracking-[.22em] text-ink-muted">
              A little closer, always
            </p>
          </div>
        </Link>
        <p className="eyebrow mb-4 mt-10 pl-3">Your shared world</p>
        <nav aria-label="Main navigation" className="flex flex-col gap-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-xs transition-colors ${pathname === href ? "bg-[#efe2e6] font-semibold text-emberDark" : "text-ink-muted hover:bg-paper2 hover:text-ink"}`}
            >
              <Icon size={17} strokeWidth={1.6} />
              <span>{label}</span>
              {href === "/cycle" && (
                <span className="ml-auto rounded-md bg-white/70 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-ember">
                  New
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-[#e6ddd4] bg-[#f3eee7] p-4">
            <Heart size={17} className="mb-3 text-ember" strokeWidth={1.5} />
            <p className="font-display text-lg leading-snug">
              Love is in the
              <br />
              <em>little things.</em>
            </p>
            <Link
              href="/notes"
              className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-emberDark"
            >
              Leave a little love <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember/10 font-display text-sm text-emberDark">
              {myName?.slice(0, 1).toUpperCase() || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {myName || "Your private space"}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[9px] text-ink-muted">
                <LockKeyhole size={9} /> Just for the two of you
              </p>
            </div>
          </div>
        </div>
      </aside>
      <header className="relative z-30 border-b border-line bg-paper/90 lg:ml-[236px]">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-9 lg:px-12">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Heart size={19} className="text-ember" />
            <span className="font-display text-xl">Humin.</span>
          </Link>
          <span className="hidden items-center gap-2 text-[11px] text-ink-muted lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Two skies. One little world.
          </span>
          <div className="flex items-center gap-2.5 text-[11px] text-ink-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper bg-[#e9dce2] font-display text-emberDark">
              {partnerName?.slice(0, 1).toUpperCase() || <Heart size={12} />}
            </span>
            <span className="max-w-[150px] truncate">
              {partnerName ? `You & ${partnerName}` : "Your story starts here"}
            </span>
            <LockKeyhole size={12} className="hidden text-ember sm:block" />
          </div>
        </div>
        <nav
          aria-label="Main navigation"
          className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 lg:hidden"
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-[11px] ${pathname === href ? "bg-ember/10 font-semibold text-emberDark" : "text-ink-muted"}`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
