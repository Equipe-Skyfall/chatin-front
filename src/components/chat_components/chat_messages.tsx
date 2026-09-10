import Image from "next/image";
import type { ChatMessage } from "@/interfaces/chat_interfaces";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="mx-auto flex w-full max-w-[670px] flex-col gap-3 px-4 py-5 sm:gap-4 sm:px-7 sm:py-7">
      <div className="mb-1 text-center text-[9px] uppercase tracking-[0.16em] text-gray/70">Hoje</div>
      {messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-24 text-center">
          <p className="max-w-xs text-sm leading-6 text-gray">Comece uma conversa com o CHATin.</p>
        </div>
      )}
      {messages.map((message) => {
        const isAssistant = message.sender === "assistant";
        return (
          <div key={message.id} className={`flex items-start gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}>
            {isAssistant && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-orange-light">
                <Image src="/CHATin-LOGO.png" alt="CHATin" width={28} height={28} className="h-full w-full object-contain" />
              </div>
            )}
            <div className={`max-w-[90%] sm:max-w-[78%] ${isAssistant ? "items-start" : "items-end"} flex flex-col`}>
              <div className={`whitespace-pre-line rounded-xl px-4 py-3 text-[13px] leading-[1.55] shadow-[0_1px_2px_rgba(34,34,34,0.04)] ${isAssistant ? "rounded-tl-[4px] border border-line bg-white text-charcoal" : "rounded-tr-[4px] bg-orange-light text-white"}`}>
                {message.content}
              </div>
              <span className="mt-1 px-1 text-[9px] text-gray/70">{message.time} · {isAssistant ? "IA Coach" : "você"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}