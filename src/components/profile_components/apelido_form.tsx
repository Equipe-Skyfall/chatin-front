"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { APELIDO_MAX, APELIDO_MIN, apelidoValido, definirApelido, getApelido } from "@/lib/apelido";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

export function ApelidoForm() {
  const [salvo, setSalvo] = useState<string | null>(null);
  const [valor, setValor] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    getApelido()
      .then(({ apelido }) => {
        if (!ativo) return;
        setSalvo(apelido);
        setValor(apelido ?? "");
      })
      .catch((error) => {
        if (ativo) toast.error(getFriendlyErrorMessage(error));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const alterado = valor.trim().replace(/\s+/g, " ") !== (salvo ?? "");

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    if (!apelidoValido(valor)) {
      setErro(`Use de ${APELIDO_MIN} a ${APELIDO_MAX} caracteres: letras, números, espaço, ponto, hífen ou sublinhado.`);
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const { apelido } = await definirApelido(valor);
      setSalvo(apelido);
      setValor(apelido ?? "");
      toast.success("Apelido salvo.");
    } catch (error) {
      if (error instanceof ApiError && error.code === "apelido_em_uso") {
        setErro("Este apelido já está em uso. Escolha outro.");
      } else {
        toast.error(getFriendlyErrorMessage(error));
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <h3 className="text-lg font-semibold text-[#18202b]">Apelido no ranking</h3>
      <p className="mt-1 text-sm text-[#737a84]">
        É o único nome que os outros alunos veem no ranking. Seu nome e e-mail não aparecem.
      </p>

      <form onSubmit={salvar} className="mt-5 grid gap-3">
        <label htmlFor="apelido" className="text-sm font-medium text-[#18202b]">
          Apelido
        </label>
        <input
          id="apelido"
          value={valor}
          maxLength={APELIDO_MAX}
          disabled={carregando || salvando}
          onChange={(event) => {
            setValor(event.target.value);
            setErro(null);
          }}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? "apelido-erro" : undefined}
          className="h-11 rounded-lg border border-[#e1e5ea] bg-white px-3 text-sm text-[#242a31] outline-none transition focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10 disabled:bg-[#f9fafb] disabled:text-[#9aa1a9]"
        />
        {erro && (
          <p id="apelido-erro" role="alert" className="text-sm text-error-ink">
            {erro}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={carregando || salvando || !alterado || valor.trim() === ""}
            className="rounded-lg bg-[#fb7118] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e9600c] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar apelido"}
          </button>
        </div>
      </form>
    </div>
  );
}
