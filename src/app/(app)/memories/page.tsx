import { PageHeading } from "@/components/ui/PageHeading";
import { redirect } from "next/navigation";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { getPhotos } from "@/lib/photos/queries";
import { getTimeCapsules } from "@/lib/timecapsules/queries";
import { PhotoAlbum } from "@/components/media/PhotoAlbum";
import { TimeCapsule } from "@/components/media/TimeCapsule";
import { Camera } from "lucide-react";

export default async function MemoriesPage() {
  const context = await getCoupleContext();
  if (!context) redirect("/");
  if (!context.partnerId || !context.partnerName) {
    return (
      <div className="mx-auto max-w-md rounded-3xl glass-card p-6 text-center border border-white/80 shadow-glass">
        <p className="font-sans text-xs font-semibold text-ink-muted">
          Waiting for your partner to join before keeping memories.
        </p>
      </div>
    );
  }

  const [photos, capsules] = await Promise.all([
    getPhotos(context.coupleId),
    getTimeCapsules(context.coupleId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Header Banner */}
      <PageHeading
        eyebrow="The moments we keep"
        title="Our kind of forever."
        description="Your favourite days, the in-between moments, and memories waiting to be made."
        icon={Camera}
      />

      {/* Main Memory Modules */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <PhotoAlbum coupleId={context.coupleId} initialPhotos={photos} />
        </div>

        <div className="flex flex-col gap-3">
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
    </div>
  );
}
