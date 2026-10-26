import { Suspense } from "react";
import ChatPage from "./chat_page";

export default function ChatRoute() {
  return (
    <Suspense fallback={null}>
      <ChatPage />
    </Suspense>
  );
}
