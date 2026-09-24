import { studyRequest } from "./api";
import type { Progresso } from "@/interfaces/progresso_interfaces";

export function obterProgresso(): Promise<Progresso> {
  return studyRequest<Progresso>("/progresso");
}
