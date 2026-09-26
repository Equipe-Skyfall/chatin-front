"use client";

import { MessageSquarePlus } from "lucide-react";
import type { Conversa } from "@/interfaces/chat_interfaces";

interface ConversationListProps {
  conversas: Conversa[];
  conversaId: string | null;
  carregando: boolean;
  onSelecionar: (id: string) => void;
  onNova: () => void;
}

function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ConversationList({ conversas, conversaId, carregando, onSelecionar, onNova }: ConversationListProps) {
  return (
    <aside className="hidden w-[340px] shrink-0 flex-col border-r border-line bg-gray-100 lg:flex">
      <div className="flex items-center justify-between px-4 py-5">
        <h2 className="font-display font-semibold text-charcoal">Conversas</h2>
        <button
          type="button"
          onClick={onNova}
          aria-label="Nova conversa"
          className="flex h-7 w-7 items-center justify-center rounded-[12px] text-gray transition-colors hover:bg-orange/10 hover:text-orange"
        >
          <MessageSquarePlus size={25} />
        </button>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4" aria-label="Conversas">
        {carregando && <p className="px-3 py-2 text-[15px] text-gray">Carregando conversas...</p>}
        {!carregando && conversas.length === 0 && (
          <p className="px-3 py-2 text-[10px] leading-4 text-gray">Nenhuma conversa ainda. Envie uma mensagem para começar.</p>
        )}
        {conversas.map((conversa) => {
          const ativa = conversa.id === conversaId;

          return (
            <button
              key={conversa.id}
              type="button"
              onClick={() => onSelecionar(conversa.id)}
              aria-current={ativa ? "true" : undefined}
              className={`flex w-full flex-col gap-0.5 rounded-[9px] px-3 py-2 text-left transition-colors ${
                ativa ? "bg-orange/10" : "hover:bg-surface"
              }`}
            >
              <span className={`truncate text-[14px] font-semibold ${ativa ? "text-orange" : "text-charcoal"}`}>
                {conversa.titulo || "Conversa sem título"}
              </span>
              <span className="text-[11px] text-gray/70">{formatarData(conversa.updated_at)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
