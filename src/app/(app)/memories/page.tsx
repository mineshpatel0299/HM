import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getPhotos } from "@/lib/photos/queries";
import { getTimeCapsules } from "@/lib/timecapsules/queries";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { PhotoAlbum } from "@/components/media/PhotoAlbum";
import { TimeCapsule } from "@/components/media/TimeCapsule";

export default async function MemoriesPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        waiting for your partner to join before there&apos;s anything to keep together.
      </p>
    );
  }

  const [photos, capsules] = await Promise.all([
    getPhotos(context.coupleId),
    getTimeCapsules(context.coupleId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/70">what you&apos;re keeping</p>
        <h1 className="font-display text-3xl">memories</h1>
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">photo album</h2>
        <PhotoAlbum coupleId={context.coupleId} initialPhotos={photos} />
      </div>

      <SectionDivider offset="right" />

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink">time capsules</h2>
        <TimeCapsule
          coupleId={context.coupleId}
          myId={context.myId}
          myName={context.myName}
          partnerName={context.partnerName}
          nextVisitDate={context.nextVisitDate}
          initialCapsules={capsules}
        />
      </div>
    </div>
  );
}
