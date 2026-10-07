import { ExternalLink, Link2 } from "lucide-react";
import type { FonteWeb } from "@/interfaces/chat_interfaces";

interface FontesPopoverProps {
  fontes: FonteWeb[];
}

function dominioDe(fonte: FonteWeb): string {
  if (fonte.dominio) return fonte.dominio;
  try {
    return new URL(fonte.url).hostname.replace(/^www\./, "");
  } catch {
    return fonte.url;
  }
}

export function FontesPopover({ fontes }: FontesPopoverProps) {
  if (fontes.length === 0) return null;

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={`${fontes.length} ${fontes.length === 1 ? "fonte" : "fontes"} na web`}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-full bg-orange-light/15 px-2 py-0.5 text-[12px] font-bold text-orange-light transition-colors hover:bg-orange-light/25 focus-visible:bg-orange-light/25"
      >
        <Link2 size={12} aria-hidden="true" />
        {fontes.length}
      </button>
      {/* pt-2 keeps the hover area continuous between the button and the card */}
      <div
        aria-label="Fontes na web"
        className="invisible absolute bottom-full left-0 z-20 w-72 max-w-[calc(100vw-3rem)] pb-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        <div className="rounded-xl bg-white p-2 shadow-neo-raised">
          <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray/70">
            Fontes na web
          </p>
          {fontes.map((fonte) => (
            <a
              key={fonte.url}
              href={fonte.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-lg px-2 py-2 text-charcoal transition-colors hover:bg-orange-light/10 focus-visible:bg-orange-light/10"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">{fonte.titulo}</span>
                <span className="block truncate text-[12px] text-gray/70">{dominioDe(fonte)}</span>
              </span>
              <ExternalLink size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-gray/70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
