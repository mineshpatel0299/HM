import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getJarState } from "@/lib/jar/queries";
import { getUnsentVaultState } from "@/lib/unsent/queries";
import { getMyScheduledNotes } from "@/lib/scheduledNotes/queries";
import { Jar } from "@/components/jar/Jar";
import { UnsentVault } from "@/components/jar/UnsentVault";
import { ScheduledNotes } from "@/components/jar/ScheduledNotes";
import { Feather } from "lucide-react";

export default async function NotesPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <div className="mx-auto max-w-md rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
        <p className="font-sans text-xs font-semibold text-ink-muted">
          Waiting for your partner to join before leaving notes.
        </p>
      </div>
    );
  }

  const [jarState, vaultState, scheduledNotes] = await Promise.all([
    getJarState(context.coupleId),
    getUnsentVaultState(context.coupleId, context.myId, context.partnerId),
    getMyScheduledNotes(context.coupleId, context.myId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {/* Header Banner */}
      <header className="flex items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/80 shadow-glass">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-semibold tracking-wider text-amber uppercase">Quiet Words</span>
            <span className="h-1 w-1 rounded-full bg-amber" />
            <span className="font-sans text-xs text-ink-muted">Memory Vault</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink font-semibold tracking-tight">
            Notes &amp; Jar
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber/10 border border-amber/20 text-amber">
          <Feather className="h-6 w-6" />
        </div>
      </header>

      {/* Main Note Modules */}
      <div className="flex flex-col gap-8">
        <Jar
          coupleId={context.coupleId}
          myId={context.myId}
          myName={context.myName}
          partnerName={context.partnerName}
          initialUnopenedCount={jarState.unopenedCount}
        />

        <UnsentVault
          coupleId={context.coupleId}
          partnerName={context.partnerName}
          initialMine={vaultState.mine}
          initialFromPartner={vaultState.fromPartner}
        />

        <ScheduledNotes
          coupleId={context.coupleId}
          myId={context.myId}
          partnerName={context.partnerName}
          initialNotes={scheduledNotes}
        />
      </div>
    </div>
  );
}
