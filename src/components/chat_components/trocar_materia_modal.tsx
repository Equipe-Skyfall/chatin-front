"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui_components/modal";
import { TrilhaCaminhoPainel } from "@/components/trilha_components/trilha_caminho_painel";
import { TrilhaMateriaOpcao } from "@/components/trilha_components/trilha_materia_opcao";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

interface TrocarMateriaModalProps {
  open: boolean;
  materias: TrilhaMateria[];
  carregando: boolean;
  /** Trilha já aberta no caminho (vem do Explorar por `?trilha=`). */
  materiaInicialId?: string | null;
  onClose: () => void;
  onIniciar: (materiaId: string, temaId: string, moduloId: string) => void;
  onSeguirSemTema: () => void;
}

/** Escolhe a trilha e o módulo em que o chat vai ancorar a conversa. */
export function TrocarMateriaModal({
  open,
  materias,
  carregando,
  materiaInicialId = null,
  onClose,
  onIniciar,
  onSeguirSemTema,
}: TrocarMateriaModalProps) {
  const [escolhidaId, setEscolhidaId] = useState<string | null>(materiaInicialId);
  const escolhida = materias.find((materia) => materia.id === escolhidaId);

  return (
    <Modal
      open={open}
      title="Chat por matéria"
      onClose={onClose}
      size="lg"
      footer={
        <button
          type="button"
          onClick={onSeguirSemTema}
          className="flex items-center gap-2 rounded-full bg-orange px-6 py-2.5 text-[13px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:shadow-neo-inset-sm"
        >
          <MessageCircle size={15} aria-hidden="true" />
          Seguir sem tema
        </button>
      }
    >
      {carregando ? (
        <p className="text-[13px] text-gray">Carregando trilha...</p>
      ) : materias.length === 0 ? (
        <p className="text-[13px] text-gray">
          Você ainda não estuda nenhuma trilha. Explore as trilhas e adicione uma aos seus estudos, ou siga sem tema.{" "}
          <Link href="/explorar" className="font-semibold text-orange hover:underline">
            Explorar trilhas
          </Link>
        </p>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-wide text-gray uppercase">Escolha a trilha</p>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-orange hover:underline focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none"
            >
              <Compass size={13} aria-hidden="true" />
              Explorar mais trilhas
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Trilhas">
            {materias.map((materia) => (
              <TrilhaMateriaOpcao
                key={materia.id}
                materia={materia}
                ativa={materia.id === escolhida?.id}
                onSelecionar={() => setEscolhidaId(materia.id === escolhida?.id ? null : materia.id)}
              />
            ))}
          </div>
          {escolhida && (
            <div>
              <TrilhaCaminhoPainel
                materia={escolhida}
                onIniciarModulo={onIniciar}
                instrucao={`Toque no ▶ para conversar sobre ${escolhida.nome}`}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
