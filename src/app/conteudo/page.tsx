import { redirect } from "next/navigation";
import ConteudoPage from "./conteudo_page";
import { lookupSession } from "@/lib/session";

export default async function ConteudoRoute() {
  const sessao = await lookupSession();

  if (sessao.status === "unauthenticated") redirect("/");
  if (sessao.status === "unavailable") redirect("/inicio");
  if (sessao.user.role !== "ADMIN") redirect("/inicio");

  return <ConteudoPage />;
}
