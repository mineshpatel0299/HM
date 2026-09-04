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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <DualClock
          myName={context.myName}
          myTimezone={context.myTimezone}
          partnerName={context.partnerName}
          partnerTimezone={context.partnerTimezone}
          partnerMoodScore={partnerMood.score}
        />
        <div className="sm:mt-3 sm:flex-1">
          <WeatherBridge
            coupleId={context.coupleId}
            partnerName={context.partnerName}
            initialWeather={weather}
          />
        </div>
      </div>

      <LiveStatusPill
        coupleId={context.coupleId}
        myId={context.myId}
        partnerName={context.partnerName}
        initialPartnerStatus={partnerStatus}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <StatCard
            coupleId={context.coupleId}
            field="sinceDate"
            label="together since"
            initialValue={context.sinceDate}
            rotation={-1}
          />
        </div>
        <div className="mt-4 flex-1">
          <StatCard
            coupleId={context.coupleId}
            field="nextVisitDate"
            label="next visit"
            initialValue={context.nextVisitDate}
            rotation={1.5}
          />
        </div>
      </div>

      <MilestoneTicker milestones={milestones} />
    </div>
  );
}
