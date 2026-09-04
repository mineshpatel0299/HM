import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { Pairing } from "./_components/Pairing";
import { AppHome } from "./_components/AppHome";
import { Hero } from "@/components/hero/Hero";

export default async function AppPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const context = await getCoupleContext();
  if (!context) return <Pairing />;

  return (
    <AppHome>
      {context.partnerName ? (
        <Hero context={context} />
      ) : (
        <p className="font-sans text-sm text-ink/70">
          waiting for them to join with your code.
        </p>
      )}
    </AppHome>
  );
}
