import type { MilestoneRow } from "@/lib/milestones/queries";
import { Flame, Award, Trophy } from "lucide-react";

function badgeIcon(milestone: MilestoneRow) {
  if (milestone.isStreak) {
    return <Flame className="h-4 w-4 text-amber fill-amber animate-pulse" />;
  }
  return <Award className="h-4 w-4 text-ember fill-ember/20" />;
}

function badgeLabel(milestone: MilestoneRow): string {
  if (milestone.isStreak && milestone.streakCount) {
    return `${milestone.streakCount}-${milestone.label.replace(" streak", "")} streak`;
  }
  return milestone.label;
}

export function MilestoneTicker({ milestones }: { milestones: MilestoneRow[] }) {
  if (milestones.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl glass-card p-5 border border-white/80 shadow-glass">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink-muted">
          Unlocked Milestones
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-paper2/90 border border-line px-3.5 py-2 shadow-sm hover:border-ember/30 transition-colors"
          >
            {badgeIcon(milestone)}
            <span className="whitespace-nowrap font-sans text-xs font-semibold text-ink">
              {badgeLabel(milestone)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
