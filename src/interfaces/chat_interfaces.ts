import type { LucideIcon } from "lucide-react";

export interface ChatMessage {
  id: number;
  content: string;
  sender: "assistant" | "user";
  time: string;
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