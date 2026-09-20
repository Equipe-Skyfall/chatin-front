import type { LucideIcon } from "lucide-react";
import type { JwtPayload } from "@/lib/jwt";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "assistant" | "user";
  time: string;
  user: JwtPayload | null;
  falhou?: boolean;
}

export interface NavigationItem {
  label: string;
  icon: LucideIcon;
}

export interface SupportDocument {
  name: string;
  type: "pdf" | "docx" | "pptx";
  details: string;
}

export type EstadoModulo = "bloqueado" | "disponivel" | "concluido";

export interface TrilhaModulo {
  id: string;
  titulo: string;
  ordem: number;
  estado: EstadoModulo;
}

export interface TrilhaTema {
  id: string;
  titulo: string;
  ordem: number;
  estado: EstadoModulo;
  modulos: TrilhaModulo[];
}

export interface TrilhaMateria {
  id: string;
  nome: string;
  temas: TrilhaTema[];
}

export interface Trilha {
  materias: TrilhaMateria[];
}

export interface Conversa {
  id: string;
  titulo: string | null;
  modulo_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mensagem {
  id: string;
  papel: string;
  conteudo: string | null;
  chamadas_ferramentas: Record<string, unknown>[] | null;
  created_at: string;
}

export interface EnviarMensagemInput {
  texto: string;
  conversa_id?: string | null;
  modulo_id?: string | null;
}

export interface ChatResposta {
  conversa_id: string;
  resposta: string;
}
