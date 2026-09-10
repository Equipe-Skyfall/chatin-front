"use client";

import { FormEvent, useState } from "react";
import { ArrowUp, Paperclip, Mic } from "lucide-react";

interface ChatComposerProps {
  onSend: (message: string) => void;
}

export function ChatComposer({ onSend }: ChatComposerProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend(message);
    setMessage("");
  }

  return (
    <div className="border-t border-line bg-white px-4 py-3 sm:px-7 sm:py-4">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-[670px] items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 focus-within:border-orange/50">
        <button type="button" aria-label="Anexar arquivo" className="text-gray transition-colors hover:text-orange"><Paperclip size={17} /></button>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva sua mensagem..." className="min-w-0 flex-1 bg-transparent px-1 text-[13px] text-charcoal outline-none placeholder:text-gray/60" />
        <button type="button" aria-label="Gravar áudio" className="hidden text-gray transition-colors hover:text-orange sm:block"><Mic size={16} /></button>
        <button type="submit" aria-label="Enviar mensagem" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-light text-white transition-transform hover:scale-105"><ArrowUp size={16} strokeWidth={2.5} /></button>
      </form>
      <p className="mt-2 text-center text-[9px] text-gray/70">CHATin usará seus arquivos como contexto · respostas podem conter imprecisões</p>
    </div>
  );
}