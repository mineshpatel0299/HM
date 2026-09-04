import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCoupleContext } from "@/lib/db/getCoupleContext";
import { Pairing } from "./_components/Pairing";
import { AppHome } from "./_components/AppHome";
import { WaitingForPartner } from "./_components/WaitingForPartner";
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
        <WaitingForPartner inviteCode={context.inviteCode} />
      )}
    </AppHome>
  );
}
