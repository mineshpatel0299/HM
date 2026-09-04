import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { UploadTest } from "./UploadTest";

export default async function DevUploadTestPage() {
  const context = await getCoupleContext();

  if (!context) {
    return (
      <p className="mx-auto max-w-sm text-center font-sans text-sm text-ink/70">
        pair with your partner first — the upload test needs a couple to scope
        the upload to.
      </p>
    );
  }

  return <UploadTest coupleId={context.coupleId} />;
}
