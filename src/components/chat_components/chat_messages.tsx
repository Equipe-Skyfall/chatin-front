import Image from "next/image";
import type { ChatMessage } from "@/interfaces/chat_interfaces";
import { MarkdownMessage } from "./markdown_message";

function nomeUsuario(user: { username: string } | null): string {
  if (!user) return "Usuário";
  return user.username;
}
interface ChatMessagesProps {
  messages: ChatMessage[];
  carregando?: boolean;
  enviando?: boolean;
}

export function ChatMessages({ messages, carregando = false, enviando = false }: ChatMessagesProps) {
  
  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-3 px-4 py-5 sm:gap-4 sm:px-7 sm:py-7">
      {messages.length > 0 && (
        <div className="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-gray/70">Hoje</div>
      )}
      {carregando && (
        <div className="flex flex-1 items-center justify-center py-24 text-center">
          <p className="text-sm text-gray">Carregando conversa...</p>
        </div>
      )}
      {!carregando && messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-24 text-center">
          <p className="max-w-xs text-sm leading-6 text-gray">Comece uma conversa com o CHATin.</p>
        </div>
      )}
      {messages.map((message) => {
        const isAssistant = message.sender === "assistant";
        return (
          <div key={message.id} className={`flex items-start gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}>
            {isAssistant && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-light shadow-neo-raised-sm">
                <Image src="/CHATin-LOGO.png" alt="CHATin" width={28} height={28} className="h-full w-full object-contain" />
              </div>
            )}
            <div className={`max-w-[90%] sm:max-w-[78%] ${isAssistant ? "items-start" : "items-end"} flex flex-col`}>
              <div className={`rounded-xl px-4 py-3 text-[13px] leading-[1.55] shadow-neo-raised-sm ${isAssistant ? "rounded-tl-[4px] bg-surface text-charcoal" : "whitespace-pre-line rounded-tr-[4px] bg-orange-light text-white"} ${message.falhou ? "opacity-60" : ""}`}>
                {isAssistant ? <MarkdownMessage content={message.content} /> : message.content}
              </div>
              <span className={`mt-1 px-1 text-[12px] ${message.falhou ? "text-[#d1442e]" : "text-gray/70"}`}>
                {message.time} · {message.falhou ? "não enviada" : isAssistant ? "CHATin" : nomeUsuario(message.user)}
              </span>
            </div>
          </div>
        );
      })}
      {enviando && (
        <div className="flex items-start gap-2">
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-light shadow-neo-raised-sm">
            <Image src="/CHATin-LOGO.png" alt="CHATin" width={28} height={28} className="h-full w-full object-contain" />
          </div>
          <div className="rounded-xl rounded-tl-[4px] bg-surface px-4 py-3 text-[13px] text-gray shadow-neo-raised-sm">
            Pensando...
          </div>
        </div>
      )}
    </div>
  );
}
