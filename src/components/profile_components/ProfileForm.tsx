"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { atualizarPerfil, type UserProfile } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { profileSchema, type ProfileFormData } from "@/lib/validation/profile";

interface ProfileFormProps {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
}

export function ProfileForm({ profile, onUpdated }: ProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: profile.username, email: profile.email },
  });

  useEffect(() => {
    reset({ username: profile.username, email: profile.email });
  }, [profile, reset]);

  async function onSubmit(data: ProfileFormData) {
    setLoading(true);
    try {
      const updated = await atualizarPerfil(profile.id, data);
      onUpdated(updated);
      toast.success("Perfil atualizado com sucesso!");
      setEditing(false);
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

  function handleCancel() {
    reset({ username: profile.username, email: profile.email });
    setEditing(false);
  }

  return (
    <div className="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#18202b]">Informações Pessoais</h3>
          <p className="mt-1 text-sm text-[#737a84]">Atualize seus dados básicos de contato.</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-medium text-[#18202b] transition hover:bg-[#f9fafb]"
          >
            <Pencil size={14} /> Editar Perfil
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="username" className="text-sm font-medium text-[#18202b]">
            Usuário
          </label>
          <input
            id="username"
            disabled={!editing}
            {...register("username")}
            className="h-11 rounded-lg border border-[#e1e5ea] bg-white px-3 text-sm text-[#242a31] outline-none transition focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10 disabled:bg-[#f9fafb] disabled:text-[#9aa1a9]"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium text-[#18202b]">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            disabled={!editing}
            {...register("email")}
            className="h-11 rounded-lg border border-[#e1e5ea] bg-white px-3 text-sm text-[#242a31] outline-none transition focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10 disabled:bg-[#f9fafb] disabled:text-[#9aa1a9]"
          />
        </div>

        {editing && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#fb7118] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e9600c] disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#18202b] transition hover:bg-[#f9fafb]"
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}