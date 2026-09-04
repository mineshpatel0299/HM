import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getRecentPingsForUser } from "@/lib/pings/queries";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { PulseButton } from "@/components/ping/PulseButton";
import { PingFeed } from "@/components/ping/PingFeed";
import { HapticComposer } from "@/components/ping/HapticComposer";
import { HeartbeatShare } from "@/components/signature/HeartbeatShare";

export default async function ConnectPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        waiting for your partner to join before you can send anything their way.
      </p>
    );
  }

  const initialEvents = await getRecentPingsForUser(context.coupleId, context.myId);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/70">a little closer</p>
        <h1 className="font-display text-3xl">connection signals</h1>
      </header>

      <PulseButton coupleId={context.coupleId} />

      <SectionDivider />

      <PingFeed
        coupleId={context.coupleId}
        myId={context.myId}
        partnerName={context.partnerName}
        initialEvents={initialEvents}
      />

      <SectionDivider offset="right" />

      <HapticComposer coupleId={context.coupleId} />

      <SectionDivider offset="left" />

      <HeartbeatShare
        coupleId={context.coupleId}
        myId={context.myId}
        partnerName={context.partnerName}
      />
    </div>
  );
}
