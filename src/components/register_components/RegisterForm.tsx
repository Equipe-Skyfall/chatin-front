"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LoginField } from "../login_components/LoginField";
import { registrar } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { registerSchema, type RegisterFormData } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    try {
      await registrar(data);
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro inesperado. Tente novamente.");
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
      <div className="w-full max-w-[404px]">
        <header>
          <h1 className="font-display text-[36px] font-bold tracking-[-.04em] text-[#18202b]">Criar conta</h1>
          <p className="mt-3 max-w-[360px] text-base leading-6 text-[#737a84]">Comece sua jornada de aprendizado acelerado hoje mesmo.</p>
        </header>

        <div className="my-7 flex items-center gap-3.5 text-[10px] font-bold tracking-[.12em] text-[#a5aab1] before:h-px before:flex-1 before:bg-[#edf0f2] after:h-px after:flex-1 after:bg-[#edf0f2]"><span>CADASTRE-SE</span></div>

        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <LoginField label="Usuário" type="text" placeholder="Seu nome de usuário" {...register("username")} />
          <LoginField label="E-mail Acadêmico ou Pessoal" type="email" placeholder="exemplo@estudante.com" {...register("email")} />
          <LoginField label="Senha" type="password" placeholder="Mínimo 8 caracteres" {...register("password")} />
          <LoginField label="Confirmar senha" type="password" placeholder="Repita sua senha" {...register("confirmPassword")} />

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[#fb7118] text-base font-bold text-white shadow-[0_10px_20px_rgba(251,113,24,.2)] transition hover:bg-[#e9600c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Criar minha conta"} {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] text-[#8b929b]">Já possui uma conta? <Link href="/" className="font-bold text-[#fb7118]">Fazer login</Link></p>
      </div>
    </section>
  );
}