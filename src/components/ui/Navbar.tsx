"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Heart, 
  Radio, 
  Gamepad2, 
  Moon, 
  Camera, 
  Feather
} from "lucide-react";

interface NavbarProps {
  partnerName?: string | null;
}

const navItems = [
  { href: "/", label: "Thread", icon: Heart },
  { href: "/connect", label: "Signals", icon: Radio },
  { href: "/play", label: "Games", icon: Gamepad2 },
  { href: "/rhythm", label: "Rhythm", icon: Moon },
  { href: "/memories", label: "Memories", icon: Camera },
  { href: "/notes", label: "Notes", icon: Feather },
];

export function Navbar({ partnerName }: NavbarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full glass-nav px-4 sm:px-8 py-3.5 mb-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-ember to-amber text-white shadow-md shadow-ember/20 transition-transform duration-300 group-hover:scale-105">
              <Heart className="h-4.5 w-4.5 fill-white/20 animate-pulse-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-tight text-ink font-semibold group-hover:text-ember transition-colors">
                Us, Anyway
              </span>
              <span className="text-[10px] font-sans tracking-widest text-ink-muted uppercase -mt-1 font-medium">
                Two skies • One thread
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-2xl bg-paper2/70 p-1.5 border border-line">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-sans font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-ember font-semibold"
                      : "text-ink-muted hover:text-ink hover:bg-paper/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-xl bg-white shadow-sm border border-ember/20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-ember" : "text-ink-muted"}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Partner Live Pill / Status */}
          <div className="flex items-center gap-2">
            {partnerName ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 text-emerald-700 text-xs font-sans font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Connected to</span>
                <span className="font-semibold text-emerald-800">{partnerName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1 border border-amber/20 text-amber text-xs font-sans font-medium">
                <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
                <span>Waiting for partner</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[92%] max-w-sm">
        <nav className="flex items-center justify-around rounded-2xl glass-card p-2 border border-white/60 shadow-floating">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-colors ${
                  isActive ? "text-ember font-semibold" : "text-ink-muted hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveDock"
                    className="absolute inset-0 rounded-xl bg-ember/10 border border-ember/30"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 ${isActive ? "text-ember" : "text-ink-muted"}`} />
                <span className="text-[10px] font-sans font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
