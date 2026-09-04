import type { MilestoneRow } from "@/lib/milestones/queries";

function badgeIcon(milestone: MilestoneRow): string {
  return milestone.isStreak ? "🔥" : "🏵";
}

function badgeLabel(milestone: MilestoneRow): string {
  if (milestone.isStreak && milestone.streakCount) {
    return `${milestone.streakCount}-${milestone.label.replace(" streak", "")} streak`;
  }
  return milestone.label;
}

/** A strip of small stamped badges, not a progress bar — each milestone is
 * a discrete, already-achieved thing, not a metric climbing toward a goal. */
export function MilestoneTicker({ milestones }: { milestones: MilestoneRow[] }) {
  if (milestones.length === 0) return null;

  // Plain divs, not motion.div: this only ever mounts at page-load, the
  // same moment AppHome's own fadeRise is already animating this whole
  // section in — a second, per-badge entrance nested inside that one is
  // redundant, not an extra flourish (same reasoning as StatCard's
  // JournalCard animateIn={false}).
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {milestones.map((milestone, index) => (
        <div
          key={milestone.id}
          style={{ rotate: `${index % 2 === 0 ? -2 : 2}deg` }}
          className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-line bg-paper2 px-3 py-2 shadow-sm"
        >
          <span className="text-lg" aria-hidden="true">
            {badgeIcon(milestone)}
          </span>
          <span className="whitespace-nowrap font-sans text-xs text-ink/70">
            {badgeLabel(milestone)}
          </span>
        </div>
      ))}
    </div>
  );
}
