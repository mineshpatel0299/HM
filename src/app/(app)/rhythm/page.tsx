import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getRecentMoments } from "@/lib/moments/queries";
import { getTodayMood } from "@/lib/moodcheckin/queries";
import { hasLoggedToday } from "@/lib/rituals/queries";
import { getRewindItems } from "@/lib/rewind/queries";
import { MomentsBoard } from "@/components/moments/MomentsBoard";
import { MoodCheckin } from "@/components/moments/MoodCheckin";
import { GoodnightButton } from "@/components/rituals/GoodnightButton";
import { RewindCard } from "@/components/media/RewindCard";
import { Moon } from "lucide-react";

export default async function RhythmPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <div className="mx-auto max-w-md rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
        <p className="font-sans text-xs font-semibold text-ink-muted">
          Waiting for your partner to join before sharing daily rhythm.
        </p>
      </div>
    );
  }

  const [moments, myMood, loggedGoodnightToday, rewindItems] = await Promise.all([
    getRecentMoments(context.coupleId),
    getTodayMood(context.coupleId, context.myId, context.myTimezone),
    hasLoggedToday(context.coupleId, context.myId, "goodnight", context.myTimezone),
    getRewindItems(context.coupleId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {/* Header Banner */}
      <header className="flex items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/80 shadow-glass">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-semibold tracking-wider text-lilac uppercase">Daily Rituals</span>
            <span className="h-1 w-1 rounded-full bg-lilac" />
            <span className="font-sans text-xs text-ink-muted">Everyday Connection</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink font-semibold tracking-tight">
            Daily Rhythm
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lilac/10 border border-lilac/20 text-lilac">
          <Moon className="h-6 w-6" />
        </div>
      </header>

      {/* Main Rhythm Modules */}
      <div className="flex flex-col gap-6">
        {rewindItems.length > 0 && (
          <div className="flex flex-col gap-3">
            {rewindItems.map((item) => (
              <RewindCard
                key={`${item.kind}-${item.id}`}
                item={item}
                myId={context.myId}
                myName={context.myName}
                partnerName={context.partnerName!}
              />
            ))}
          </div>
        )}

        <MomentsBoard
          coupleId={context.coupleId}
          myId={context.myId}
          myName={context.myName}
          partnerName={context.partnerName}
          initialMoments={moments}
        />

        <MoodCheckin
          coupleId={context.coupleId}
          alreadyCheckedInToday={myMood.checkedInToday}
          initialScore={myMood.score}
        />

        <GoodnightButton
          coupleId={context.coupleId}
          partnerName={context.partnerName}
          initialLoggedToday={loggedGoodnightToday}
        />
      </div>
    </div>
  );
}
