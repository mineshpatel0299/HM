import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import { HapticReceiver } from "@/components/ping/HapticComposer";
import { Navbar } from "@/components/ui/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getCoupleContext();

  return (
    <div className="relative min-h-screen pb-10 text-ink">
      <Navbar partnerName={context?.partnerName} myName={context?.myName} />

      <main className="px-5 py-8 sm:px-9 sm:py-10 lg:ml-[236px] lg:px-12">
        <div className="mx-auto max-w-[1120px]">
          {context ? (
            <RealtimeProvider coupleId={context.coupleId}>
              {children}
              {context.partnerName && (
                <HapticReceiver
                  myId={context.myId}
                  partnerName={context.partnerName}
                />
              )}
            </RealtimeProvider>
          ) : (
            children
          )}
        </div>
        <footer className="mx-auto mt-12 flex max-w-[1120px] items-center justify-between border-t border-line pt-5 text-[10px] text-ink-muted">
          <span>Made for your kind of love.</span>
          <span>Us, Anyway &copy; {new Date().getFullYear()}</span>
        </footer>
      </main>
    </div>
  );
}
