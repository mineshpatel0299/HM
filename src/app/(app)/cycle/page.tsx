import { redirect } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Flower2 } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCycleState } from "@/lib/cycle/queries";
import { PeriodTracker } from "@/components/cycle/PeriodTracker";
import { PageHeading } from "@/components/ui/PageHeading";

export default async function CyclePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [state, [profile]] = await Promise.all([
    getCycleState(),
    getDb()
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1),
  ]);
  return (
    <div className="flex flex-col gap-7">
      <PageHeading
        eyebrow="A little care for you"
        title="Your body. Your rhythm."
        description="A gentle space to understand your cycle and check in with yourself."
        icon={Flower2}
      />
      <PeriodTracker
        initialState={state}
        today={formatInTimeZone(
          new Date(),
          profile?.timezone ?? "UTC",
          "yyyy-MM-dd",
        )}
      />
    </div>
  );
}
