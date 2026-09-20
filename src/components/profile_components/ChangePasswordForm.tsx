"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  alterarSenha,
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

interface ChangePasswordFormProps {
  userId: string;
}

type CampoSenha = "currentPassword" | "newPassword" | "confirmPassword";

export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [visivel, setVisivel] = useState<Record<CampoSenha, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) });

  function alternarVisibilidade(campo: CampoSenha) {
    setVisivel((atual) => ({ ...atual, [campo]: !atual[campo] }));
  }

  async function onSubmit(data: ChangePasswordFormData) {
    setLoading(true);
    try {
      await alterarSenha(userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Senha alterada com sucesso!");
      reset();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <h3 className="text-lg font-semibold text-[#18202b]">Alterar Senha</h3>
      <p className="mt-1 text-sm text-[#737a84]">Atualize sua senha de acesso.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 max-w-md">
        <div>
          <label className="text-sm font-medium text-[#18202b]">Senha Atual</label>
          <div className="relative mt-1">
            <input
              type={visivel.currentPassword ? "text" : "password"}
              {...register("currentPassword")}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 pr-10 text-sm outline-none focus:border-[#fb7118]"
            />
            <button
              type="button"
              onClick={() => alternarVisibilidade("currentPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b929b] hover:text-[#18202b]"
              aria-label={visivel.currentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
              tabIndex={-1}
            >
              {visivel.currentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#18202b]">Nova Senha</label>
          <div className="relative mt-1">
            <input
              type={visivel.newPassword ? "text" : "password"}
              {...register("newPassword")}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 pr-10 text-sm outline-none focus:border-[#fb7118]"
            />
            <button
              type="button"
              onClick={() => alternarVisibilidade("newPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b929b] hover:text-[#18202b]"
              aria-label={visivel.newPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
              tabIndex={-1}
            >
              {visivel.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#18202b]">Confirmar Nova Senha</label>
          <div className="relative mt-1">
            <input
              type={visivel.confirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 pr-10 text-sm outline-none focus:border-[#fb7118]"
            />
            <button
              type="button"
              onClick={() => alternarVisibilidade("confirmPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b929b] hover:text-[#18202b]"
              aria-label={visivel.confirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
              tabIndex={-1}
            >
              {visivel.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 rounded-[10px] bg-[#fb7118] text-sm font-bold text-white transition hover:bg-[#e9600c] disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar Nova Senha"}
        </button>
      </form>
    </div>
  );
}