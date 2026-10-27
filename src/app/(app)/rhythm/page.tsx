import { PageHeading } from "@/components/ui/PageHeading";
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

  const [moments, myMood, loggedGoodnightToday, rewindItems] =
    await Promise.all([
      getRecentMoments(context.coupleId),
      getTodayMood(context.coupleId, context.myId, context.myTimezone),
      hasLoggedToday(
        context.coupleId,
        context.myId,
        "goodnight",
        context.myTimezone,
      ),
      getRewindItems(context.coupleId),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Header Banner */}
      <PageHeading
        eyebrow="Your everyday rituals"
        title="Find your shared rhythm."
        description="Small check-ins, everyday moments, and a goodnight that feels a little closer."
        icon={Moon}
      />

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
