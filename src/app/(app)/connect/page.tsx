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
          Waiting for your partner to join before you can send connection signals.
        </p>
      </div>
    );
  }

  const initialEvents = await getRecentPingsForUser(context.coupleId, context.myId);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {/* Page Header */}
      <header className="flex items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/80 shadow-glass">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-semibold tracking-wider text-ember uppercase">Signals &amp; Touch</span>
            <span className="h-1 w-1 rounded-full bg-ember" />
            <span className="font-sans text-xs text-ink-muted">Realtime</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink font-semibold tracking-tight">
            Connection Signals
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember/10 border border-ember/20 text-ember">
          <Radio className="h-6 w-6 animate-pulse" />
        </div>
      </header>

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
