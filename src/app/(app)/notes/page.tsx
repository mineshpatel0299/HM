import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getJarState } from "@/lib/jar/queries";
import { getUnsentVaultState } from "@/lib/unsent/queries";
import { getMyScheduledNotes } from "@/lib/scheduledNotes/queries";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Jar } from "@/components/jar/Jar";
import { UnsentVault } from "@/components/jar/UnsentVault";
import { ScheduledNotes } from "@/components/jar/ScheduledNotes";

export default async function NotesPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        waiting for your partner to join before there&apos;s anyone to leave notes for.
      </p>
    );
  }

  const [jarState, vaultState, scheduledNotes] = await Promise.all([
    getJarState(context.coupleId),
    getUnsentVaultState(context.coupleId, context.myId, context.partnerId),
    getMyScheduledNotes(context.coupleId, context.myId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/70">the quiet ones</p>
        <h1 className="font-display text-3xl">notes</h1>
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">the jar</h2>
        <Jar
          coupleId={context.coupleId}
          myId={context.myId}
          myName={context.myName}
          partnerName={context.partnerName}
          initialUnopenedCount={jarState.unopenedCount}
        />
      </div>

      <SectionDivider offset="right" />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">unsent messages</h2>
        <UnsentVault
          coupleId={context.coupleId}
          partnerName={context.partnerName}
          initialMine={vaultState.mine}
          initialFromPartner={vaultState.fromPartner}
        />
      </div>

      <SectionDivider offset="left" />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">scheduled notes</h2>
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
