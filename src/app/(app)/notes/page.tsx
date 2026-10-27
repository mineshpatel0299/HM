import { PageHeading } from "@/components/ui/PageHeading";
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Header Banner */}
      <PageHeading
        eyebrow="From one heart to another"
        title="Some things deserve words."
        description="Little love notes, thoughts for later, and the things only you two understand."
        icon={Feather}
      />

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
