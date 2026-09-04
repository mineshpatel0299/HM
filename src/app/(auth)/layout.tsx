import { JournalCard } from "@/components/ui/JournalCard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16 text-ink">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <header className="flex flex-col gap-1 text-center">
          <p className="font-sans text-sm text-ink/70">us, anyway</p>
          <h1 className="font-display text-3xl">a shared thread</h1>
        </header>
        <JournalCard corner="a" className="w-full">
          {children}
        </JournalCard>
      </div>
    </main>
  );
}
