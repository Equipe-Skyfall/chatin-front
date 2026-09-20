"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  alterarSenha,
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

interface ChangePasswordFormProps {
  userId: string;
}

export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) });

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
          <label htmlFor="currentPassword" className="text-sm font-medium text-[#18202b]">Senha Atual</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#fb7118]"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#18202b]">Nova Senha</label>
          <input
            type="password"
            {...register("newPassword")}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#fb7118]"
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#18202b]">Confirmar Nova Senha</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#fb7118]"
          />
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