import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12 text-ink overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-ember/20 via-rose-300/20 to-amber/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-ember to-amber text-white shadow-xl shadow-ember/25">
            <Heart className="h-7 w-7 fill-white/20 animate-pulse-slow" />
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              Us, Anyway
            </h1>
            <p className="font-sans text-xs text-ink-muted uppercase tracking-widest font-semibold">
              A private thread between two skies
            </p>
          </div>
        </header>

        <div className="w-full rounded-3xl glass-card p-6 sm:p-8 border border-white/80 shadow-glass">
          {children}
        </div>
      </div>
    </main>
  );
}
