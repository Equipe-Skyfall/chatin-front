"use client";

import { useState } from "react";
import type { ChatMessage } from "@/interfaces/chat_interfaces";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function sendMessage(content: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        sender: "user",
        content: trimmedContent,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }

  return { messages, sendMessage };
}