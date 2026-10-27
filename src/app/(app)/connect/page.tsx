import { PageHeading } from "@/components/ui/PageHeading";
import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getRecentPingsForUser } from "@/lib/pings/queries";
import { PulseButton } from "@/components/ping/PulseButton";
import { PingFeed } from "@/components/ping/PingFeed";
import { HapticComposer } from "@/components/ping/HapticComposer";
import { HeartbeatShare } from "@/components/signature/HeartbeatShare";
import { Radio } from "lucide-react";

export default async function ConnectPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <div className="mx-auto max-w-md rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
        <p className="font-sans text-xs font-semibold text-ink-muted">
          Waiting for your partner to join before you can send connection
          signals.
        </p>
      </div>
    );
  }

  const initialEvents = await getRecentPingsForUser(
    context.coupleId,
    context.myId,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Page Header */}
      <PageHeading
        eyebrow="A thought, a touch, a signal"
        title="Close, even from here."
        description="Send a little presence across the distance. Sometimes a feeling says it all."
        icon={Radio}
      />

      {/* Main Signal Tools */}
      <div className="flex flex-col gap-6">
        <PulseButton coupleId={context.coupleId} />

        <PingFeed
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          initialEvents={initialEvents}
        />

        <HapticComposer coupleId={context.coupleId} />

        <HeartbeatShare
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
        />
      </div>
    </div>
  );
}
