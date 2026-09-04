import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import { HapticReceiver } from "@/components/ping/HapticComposer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await getCoupleContext();

  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink sm:px-12">
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
  );
}
