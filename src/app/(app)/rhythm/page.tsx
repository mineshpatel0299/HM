import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getRecentMoments } from "@/lib/moments/queries";
import { getTodayMood } from "@/lib/moodcheckin/queries";
import { hasLoggedToday } from "@/lib/rituals/queries";
import { getRewindItems } from "@/lib/rewind/queries";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { MomentsBoard } from "@/components/moments/MomentsBoard";
import { MoodCheckin } from "@/components/moments/MoodCheckin";
import { GoodnightButton } from "@/components/rituals/GoodnightButton";
import { RewindCard } from "@/components/media/RewindCard";

export default async function RhythmPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        waiting for your partner to join before there&apos;s a rhythm to share.
      </p>
    );
  }

  const [moments, myMood, loggedGoodnightToday, rewindItems] = await Promise.all([
    getRecentMoments(context.coupleId),
    getTodayMood(context.coupleId, context.myId, context.myTimezone),
    hasLoggedToday(context.coupleId, context.myId, "goodnight", context.myTimezone),
    getRewindItems(context.coupleId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/70">the everyday of it</p>
        <h1 className="font-display text-3xl">daily rhythm</h1>
      </header>

      <div className="flex flex-col gap-4">
        {rewindItems.length > 0 && (
          <div className="flex flex-col gap-2">
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
      </div>

      <SectionDivider offset="right" />

      <MoodCheckin
        coupleId={context.coupleId}
        alreadyCheckedInToday={myMood.checkedInToday}
        initialScore={myMood.score}
      />

      <SectionDivider offset="left" />

      <GoodnightButton
        coupleId={context.coupleId}
        partnerName={context.partnerName}
        initialLoggedToday={loggedGoodnightToday}
      />
    </div>
  );
}
