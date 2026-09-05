import { getStatus } from "@/lib/status/queries";
import { getPartnerWeather } from "@/lib/weather/actions";
import { getTodayMood } from "@/lib/moodcheckin/queries";
import { checkDaysTogetherMilestones } from "@/lib/milestones/checkMilestones";
import { getMilestones } from "@/lib/milestones/queries";
import type { CoupleContext } from "@/lib/db/getCoupleContext";
import { DualClock } from "./DualClock";
import { LiveStatusPill } from "./LiveStatusPill";
import { StatCard } from "./StatCard";
import { WeatherBridge } from "./WeatherBridge";
import { MilestoneTicker } from "./MilestoneTicker";

export async function Hero({ context }: { context: CoupleContext }) {
  if (!context.partnerId || !context.partnerName || !context.partnerTimezone) return null;

  await checkDaysTogetherMilestones(context.coupleId, context.sinceDate);

  const [partnerStatus, weather, partnerMood, milestones] = await Promise.all([
    getStatus(context.partnerId),
    getPartnerWeather(context.coupleId),
    getTodayMood(context.coupleId, context.partnerId, context.partnerTimezone),
    getMilestones(context.coupleId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Grid: Dual Clocks & Weather */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-6 flex justify-center md:justify-start">
          <DualClock
            myName={context.myName}
            myTimezone={context.myTimezone}
            partnerName={context.partnerName}
            partnerTimezone={context.partnerTimezone}
            partnerMoodScore={partnerMood.score}
          />
        </div>
        <div className="md:col-span-6 flex flex-col justify-center">
          <WeatherBridge
            coupleId={context.coupleId}
            partnerName={context.partnerName}
            initialWeather={weather}
          />
        </div>
      </div>

      {/* Live Status Pill */}
      <LiveStatusPill
        coupleId={context.coupleId}
        myId={context.myId}
        partnerName={context.partnerName}
        initialPartnerStatus={partnerStatus}
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          coupleId={context.coupleId}
          field="sinceDate"
          label="together since"
          initialValue={context.sinceDate}
        />
        <StatCard
          coupleId={context.coupleId}
          field="nextVisitDate"
          label="next visit"
          initialValue={context.nextVisitDate}
        />
      </div>

      {/* Milestone Ticker */}
      <MilestoneTicker milestones={milestones} />
    </div>
  );
}
