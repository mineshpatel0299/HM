import { PageHeading } from "@/components/ui/PageHeading";
import { formatInTimeZone } from "date-fns-tz";
import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getPromptForDate } from "@/lib/spark/prompts";
import { getSparkState } from "@/lib/spark/queries";
import { getDiaryState } from "@/lib/diary/queries";
import { getLadderProgress } from "@/lib/truthladder/queries";
import { getGuessDayState } from "@/lib/guessday/queries";
import { SparkCard } from "@/components/spark/SparkCard";
import { ParallelDiary } from "@/components/games/ParallelDiary";
import { TruthLadder } from "@/components/games/TruthLadder";
import { GuessMyDay } from "@/components/games/GuessMyDay";
import { Gamepad2 } from "lucide-react";

export default async function PlayPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <div className="mx-auto max-w-md rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
        <p className="font-sans text-xs font-semibold text-ink-muted">
          Waiting for your partner to join before games are unlocked.
        </p>
      </div>
    );
  }

  const today = new Date();
  const todayKey = formatInTimeZone(today, "UTC", "yyyy-MM-dd");
  const prompt = getPromptForDate(today);

  const [sparkState, diaryState, ladderProgress, guessDayState] =
    await Promise.all([
      getSparkState(context.coupleId, context.myId, prompt.id),
      getDiaryState(context.coupleId, context.myId, todayKey),
      getLadderProgress(context.coupleId),
      getGuessDayState(
        context.coupleId,
        todayKey,
        context.myId,
        context.partnerId,
      ),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Header Banner */}
      <PageHeading
        eyebrow="Stay curious about each other"
        title="A little spark. A little play."
        description="Make time for a question, a shared laugh, or something you never knew about them."
        icon={Gamepad2}
      />

      {/* Main Game Modules */}
      <div className="flex flex-col gap-6">
        <SparkCard
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          promptId={prompt.id}
          promptText={prompt.text}
          initialMine={sparkState.myAnswer}
          initialPartner={sparkState.partnerAnswer}
        />

        <ParallelDiary
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          entryDate={todayKey}
          dateLabel={todayKey}
          initialMine={diaryState.myEntry}
          initialPartner={diaryState.partnerEntry}
        />

        <TruthLadder
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          initialLevel={ladderProgress.currentLevel}
          initialAckedBy={ladderProgress.ackedBy}
        />

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
