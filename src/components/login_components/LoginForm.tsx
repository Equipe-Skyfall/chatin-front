"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import Link from "next/link";
import { LoginField } from "./LoginField";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginFormData } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      await login(data);
      toast.success("Login realizado com sucesso!");
      router.push("/chat");
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function onInvalid() {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message as string);
  }

  return (
    <section className="flex min-h-[620px] items-center justify-center px-6 py-12 sm:px-10 lg:min-h-screen lg:px-16">
      <div className="w-full max-w-[377px]">
        <header>
          <h1 className="font-display text-[36px] font-bold tracking-[-.04em] text-[#18202b]">Acessar conta</h1>
          <p className="mt-3 max-w-[340px] text-base leading-6 text-[#737a84]">Continue sua jornada de aprendizado acelerado hoje mesmo.</p>
        </header>

        <div className="my-10 flex items-center gap-3.5 text-[10px] font-bold tracking-[.16em] text-[#a5aab1] before:h-px before:flex-1 before:bg-[#edf0f2] after:h-px after:flex-1 after:bg-[#edf0f2]"><span>ACESSE COM E-MAIL</span></div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="grid gap-5">
          <LoginField
            label="E-mail Acadêmico ou Pessoal"
            type="email"
            placeholder="exemplo@estudante.com"
            {...register("email")}
          />
          <LoginField
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
          />

          <div className="flex items-center justify-between text-[13px] text-[#8b929b]">
            <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-[#fb7118]" /> Lembrar de mim</label>
            <a href="#forgot-password" className="font-bold text-[#fb7118]">Esqueceu a senha?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-[10px] bg-[#fb7118] text-base font-bold text-white shadow-[0_10px_20px_rgba(251,113,24,.2)] transition hover:bg-[#e9600c] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar na Plataforma"} <span className="ml-2 text-lg">→</span>
          </button>
        </form>

        <p className="my-8 text-center text-[13px] text-[#8b929b]">Ainda não possui uma conta? <Link href="/cadastro" className="font-bold text-[#fb7118]">Criar conta</Link></p>
        <div className="flex items-center gap-3 rounded-[13px] border border-[#f0f1f3] bg-[#fafbfc] p-5"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#eceff1] bg-white text-[#fb7118]"><Check size={17} /></span><span><strong className="block text-[13px] text-[#27303a]">Sua jornada começa agora!</strong><small className="mt-1 block text-[12px] text-[#8f969f]">Assistente de IA disponível 24/7</small></span></div>
        <p className="mt-7 text-center text-[11px] italic text-[#adb3bb]">✦ Estude de forma mais inteligente, não mais difícil.</p>
      </div>
    </section>
  );
}