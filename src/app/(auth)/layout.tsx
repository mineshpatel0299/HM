import { Heart, LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen text-ink lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#503342] p-12 text-white lg:flex xl:p-16">
        <Link
          href="/"
          className="relative z-10 flex items-center gap-3 font-display text-2xl"
        >
          <Heart size={24} strokeWidth={1.3} />
          Us, Anyway.
        </Link>
        <div className="relative z-10 max-w-lg py-16">
          <p className="mb-7 text-[10px] uppercase tracking-[.25em] text-[#e7bac6]">
            A little closer, always
          </p>
          <h1 className="font-display text-5xl font-normal leading-[1.15] xl:text-6xl">
            Your favourite
            <br />
            person.
            <br />
            <em className="text-[#e7bac6]">Your little world.</em>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/65">
            For the daily check-ins, the just-because notes, and every little
            moment that keeps you close.
          </p>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-[11px] text-white/55">
          <LockKeyhole size={13} />A private space for the two of you.
        </p>
        <div
          aria-hidden="true"
          className="absolute -bottom-36 -right-40 h-[520px] w-[520px] rounded-full border border-white/10 p-16"
        >
          <div className="h-full w-full rounded-full border border-white/10 p-16">
            <div className="h-full w-full rounded-full border border-white/10" />
          </div>
        </div>
      </section>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-9">
            <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/10 text-ember">
              <Heart size={22} strokeWidth={1.4} />
            </span>
            <p className="eyebrow mb-3 text-ember">Welcome to Us, Anyway</p>
            <h2 className="font-display text-3xl font-medium sm:text-4xl">
              Come a little closer.
            </h2>
            <p className="mt-3 text-xs leading-6 text-ink-muted">
              Your shared days and little moments are waiting.
            </p>
          </div>
          <div className="premium-card p-6 sm:p-7">{children}</div>
          <p className="mt-7 text-center text-[10px] text-ink-muted">
            Two skies. One little world.
          </p>
        </div>
      </section>
    </main>
  );
}
