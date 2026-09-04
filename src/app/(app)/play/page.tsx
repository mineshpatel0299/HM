import { formatInTimeZone } from "date-fns-tz";
import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getPromptForDate } from "@/lib/spark/prompts";
import { getSparkState } from "@/lib/spark/queries";
import { getDiaryState } from "@/lib/diary/queries";
import { getLadderProgress } from "@/lib/truthladder/queries";
import { getGuessDayState } from "@/lib/guessday/queries";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { SparkCard } from "@/components/spark/SparkCard";
import { ParallelDiary } from "@/components/games/ParallelDiary";
import { TruthLadder } from "@/components/games/TruthLadder";
import { GuessMyDay } from "@/components/games/GuessMyDay";

export default async function PlayPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        waiting for your partner to join before there&apos;s anyone to play with.
      </p>
    );
  }

  // Canonical UTC calendar date, not either partner's local date — with two
  // different timezones there's no single "today" otherwise.
  const today = new Date();
  const todayKey = formatInTimeZone(today, "UTC", "yyyy-MM-dd");
  const prompt = getPromptForDate(today);

  const [sparkState, diaryState, ladderProgress, guessDayState] = await Promise.all([
    getSparkState(context.coupleId, context.myId, prompt.id),
    getDiaryState(context.coupleId, context.myId, todayKey),
    getLadderProgress(context.coupleId),
    getGuessDayState(context.coupleId, todayKey, context.myId, context.partnerId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/70">for the two of you</p>
        <h1 className="font-display text-3xl">spark &amp; games</h1>
      </header>

      <SparkCard
        coupleId={context.coupleId}
        myId={context.myId}
        partnerName={context.partnerName}
        promptId={prompt.id}
        promptText={prompt.text}
        initialMine={sparkState.myAnswer}
        initialPartner={sparkState.partnerAnswer}
      />

      <SectionDivider offset="right" />

      <ParallelDiary
        coupleId={context.coupleId}
        myId={context.myId}
        partnerName={context.partnerName}
        entryDate={todayKey}
        dateLabel={todayKey}
        initialMine={diaryState.myEntry}
        initialPartner={diaryState.partnerEntry}
      />

      <SectionDivider offset="left" />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">truth ladder</h2>
        <TruthLadder
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          initialLevel={ladderProgress.currentLevel}
          initialAckedBy={ladderProgress.ackedBy}
        />
      </div>

      <SectionDivider offset="right" />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">guess my day</h2>
        <GuessMyDay
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          predictDate={todayKey}
          initialMine={guessDayState.mine}
          initialPartnerRow={guessDayState.partnerRow}
          initialMyScore={guessDayState.myScore}
          initialPartnerScore={guessDayState.partnerScore}
        />
      </div>
    </div>
  );
}
