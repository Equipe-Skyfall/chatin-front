import type { Metadata } from "next";
import { Toaster } from "sonner";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHATin",
  description: "Seu espaço para estudar com mais clareza.",
  icons: {
    icon: "/CHATin-LOGO.png",
    shortcut: "/CHATin-LOGO.png",
    apple: "/CHATin-LOGO.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <Toaster richColors expand position="top-center" />
      </body>
    </html>
  );
}