"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { EstadoModulo } from "@/interfaces/chat_interfaces";

export interface DropdownOption {
  value: string;
  label: string;
  estado?: EstadoModulo;
}

interface DropdownSelectProps {
  label: string;
  value: string | null;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const ESTADO_LABEL: Record<EstadoModulo, string> = {
  disponivel: "Disponível",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
};

const ESTADO_CLASSES: Record<EstadoModulo, string> = {
  disponivel: "bg-orange/10 text-orange",
  concluido: "bg-[#DDE9C5] text-[#3f6b34]",
  bloqueado: "bg-gray/10 text-gray",
};

const labelClassName = "text-[9px] font-bold uppercase tracking-[0.14em] text-gray";

export function DropdownSelect({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: DropdownSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const indiceSelecionado = options.findIndex((option) => option.value === value);
  const selecionada = indiceSelecionado >= 0 ? options[indiceSelecionado] : null;

  function habilitado(index: number): boolean {
    return options[index] !== undefined && options[index].estado !== "bloqueado";
  }

  function primeiroHabilitado(): number {
    return options.findIndex((option) => option.estado !== "bloqueado");
  }

  function abrir(indiceInicial: number = indiceSelecionado) {
    setAberto(true);
    setAtivo(habilitado(indiceInicial) ? indiceInicial : primeiroHabilitado());
  }

  function fechar() {
    setAberto(false);
    setAtivo(-1);
    triggerRef.current?.focus();
  }

  function mover(direcao: 1 | -1) {
    if (options.length === 0) return;

    let proximo = ativo;
    for (let passo = 0; passo < options.length; passo += 1) {
      proximo = (proximo + direcao + options.length) % options.length;
      if (habilitado(proximo)) {
        setAtivo(proximo);
        return;
      }
    }
  }

  function escolher(index: number) {
    if (!habilitado(index)) return;
    onChange(options[index].value);
    fechar();
  }

  function aoTeclar(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (aberto) mover(1);
        else abrir();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (aberto) mover(-1);
        else abrir();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (aberto) escolher(ativo);
        else abrir();
        break;
      case "Escape":
        if (aberto) {
          event.preventDefault();
          fechar();
        }
        break;
      case "Tab":
        if (aberto) setAberto(false);
        break;
    }
  }

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setAberto(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  return (
    <div ref={wrapperRef} className="relative grid gap-1" onKeyDown={aoTeclar}>
      <span className={labelClassName}>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => (aberto ? fechar() : abrir())}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-[8px] border bg-white px-2.5 text-left text-[15px] outline-none transition ${
          aberto ? "border-orange ring-4 ring-orange/15" : "border-line"
        } ${selecionada ? "text-charcoal" : "text-gray"} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="truncate">{selecionada ? selecionada.label : placeholder}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${aberto ? "rotate-180 text-orange" : "text-gray"}`}
        />
      </button>

      {aberto && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-[12px] border border-line bg-white p-1 shadow-neo-raised"
        >
          {options.length === 0 && <p className="px-3 py-2 text-[13px] text-gray">Nenhuma opção disponível</p>}
          {options.map((option, index) => {
            const bloqueado = option.estado === "bloqueado";
            const selecionado = option.value === value;
            const destacado = index === ativo;

            return (
              <button
                key={option.value || "__vazio"}
                type="button"
                role="option"
                aria-selected={selecionado}
                disabled={bloqueado}
                onMouseEnter={() => !bloqueado && setAtivo(index)}
                onClick={() => escolher(index)}
                className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] transition ${
                  selecionado ? "bg-orange/10 font-semibold text-orange" : "text-charcoal"
                } ${destacado && !selecionado ? "bg-surface" : ""} ${
                  bloqueado ? "cursor-not-allowed opacity-45" : "hover:bg-surface"
                }`}
              >
                <span className="truncate">{option.label}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {option.estado && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-neo-inset-sm ${ESTADO_CLASSES[option.estado]}`}
                    >
                      {ESTADO_LABEL[option.estado]}
                    </span>
                  )}
                  {selecionado && <Check size={14} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
