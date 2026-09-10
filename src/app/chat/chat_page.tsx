"use client";

import { useChat } from "@/hooks/use_chat";
import { ChatComposer } from "@/components/chat_components/chat_composer";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";

export default function ChatPage() {
  const { messages, sendMessage } = useChat();

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="CHATin" />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto"><ChatMessages messages={messages} /></div>
          <ChatComposer onSend={sendMessage} />
        </div>
      </section>
    </main>
  );
}