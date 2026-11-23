import { redirect } from "next/navigation";
import ConsumoIaPage from "./consumo_ia_page";
import { lookupSession } from "@/lib/session";

export default async function ConsumoIaRoute() {
  const sessao = await lookupSession();

  if (sessao.status === "unauthenticated") redirect("/");
  if (sessao.status === "unavailable") redirect("/inicio");
  if (sessao.user.role !== "ADMIN") redirect("/inicio");

  return <ConsumoIaPage />;
}
