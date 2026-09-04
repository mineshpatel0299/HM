import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { RealtimeTest } from "./RealtimeTest";

export default async function DevRealtimeTestPage() {
  const context = await getCoupleContext();

  if (!context) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        pair with your partner first — the realtime test needs a couple channel
        to talk on.
      </p>
    );
  }

  return <RealtimeTest coupleId={context.coupleId} myName={context.myName} />;
}
