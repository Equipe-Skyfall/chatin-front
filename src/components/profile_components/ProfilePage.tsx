"use client";

import { useEffect, useState } from "react";
import { getPerfil, type UserProfile } from "@/lib/auth";
import { decodeToken } from "@/lib/jwt";
import { getToken } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { toast } from "sonner";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { AppHeader } from "@/components/layout_components/app_header";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileForm } from "./ProfileForm";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = getToken();
      const payload = token ? decodeToken(token) : null;

      if (!payload) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPerfil(payload.userId);
        setProfile(data);
      } catch (error) {
        toast.error(getFriendlyErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Minha Conta" />
        <div className="flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:px-16">
          {loading && <p className="text-[#737a84]">Carregando...</p>}

          {!loading && !profile && (
            <p className="text-[#737a84]">Não foi possível carregar seu perfil.</p>
          )}

          {!loading && profile && (
            <>
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-[#18202b]">Minha Conta</h1>
                <p className="mt-1 text-[#737a84]">Gerencie suas informações pessoais e configurações de segurança.</p>
              </header>

              <div className="mb-6 flex gap-2 border-b border-[#e5e7eb]">
                <button className="border-b-2 border-[#fb7118] px-1 pb-3 text-sm font-semibold text-[#18202b]">
                  Geral
                </button>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                <ProfileSidebar username={profile.username} createdAt={profile.createdAt} />
                <ProfileForm profile={profile} onUpdated={setProfile} />
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}