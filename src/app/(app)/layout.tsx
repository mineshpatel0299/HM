import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import { HapticReceiver } from "@/components/ping/HapticComposer";
import { Navbar } from "@/components/ui/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await getCoupleContext();

  return (
    <div className="relative min-h-screen text-ink pb-24 md:pb-12">
      <Navbar partnerName={context?.partnerName} />

      <main className="px-4 sm:px-8 max-w-4xl mx-auto">
        {context ? (
          <RealtimeProvider coupleId={context.coupleId}>
            {children}
            {context.partnerName && (
              <HapticReceiver myId={context.myId} partnerName={context.partnerName} />
            )}
          </RealtimeProvider>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
