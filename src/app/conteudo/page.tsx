import { redirect } from "next/navigation";
import ConteudoPage from "./conteudo_page";
import { lookupSession } from "@/lib/session";

export default async function ConteudoRoute() {
  const sessao = await lookupSession();

  if (sessao.status === "unauthenticated") redirect("/");
  if (sessao.status === "unavailable") redirect("/chat");
  if (sessao.user.role !== "ADMIN") redirect("/chat");

  return <ConteudoPage />;
}
