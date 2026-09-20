import { redirect } from "next/navigation";
import ConteudoPage from "./conteudo_page";
import { getSessionUser } from "@/lib/session";

export default async function ConteudoRoute() {
  const user = await getSessionUser();

  if (!user) redirect("/");
  if (user.role !== "ADMIN") redirect("/chat");

  return <ConteudoPage />;
}
