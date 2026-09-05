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
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {/* Header Banner */}
      <header className="flex items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/80 shadow-glass">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-semibold tracking-wider text-rose-500 uppercase">Shared Vault</span>
            <span className="h-1 w-1 rounded-full bg-rose-500" />
            <span className="font-sans text-xs text-ink-muted">Timeless</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink font-semibold tracking-tight">
            Memories &amp; Gallery
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <Camera className="h-6 w-6" />
        </div>
      </header>

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
