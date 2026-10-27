import type { LucideIcon } from "lucide-react";

export function PageHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <header className="mb-2 flex items-center justify-between gap-5">
      <div>
        <p className="eyebrow mb-3 text-ember">{eyebrow}</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-[38px]">
          {title}
        </h1>
        <p className="mt-3 max-w-lg text-xs leading-relaxed text-ink-muted sm:text-sm">
          {description}
        </p>
      </div>
      <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-ember/10 bg-ember/5 text-ember sm:flex">
        <Icon size={23} strokeWidth={1.4} />
      </span>
    </header>
  );
}
