import { redirect } from "next/navigation";
import { ProfilePage } from "@/components/profile_components/ProfilePage";
import { lookupSession } from "@/lib/session";

export default async function PerfilRoute() {
  const sessao = await lookupSession();

  if (sessao.status === "unauthenticated") redirect("/");

  return <ProfilePage />;
}
