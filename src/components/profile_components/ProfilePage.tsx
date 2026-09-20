"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPerfil, logout, type UserProfile } from "@/lib/auth";
import { decodeToken } from "@/lib/jwt";
import { getToken } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { AppHeader } from "@/components/layout_components/app_header";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileForm } from "./ProfileForm";

export function ProfilePage() {
  const router = useRouter();
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

  function handleLogout() {
    logout();
    toast.success("Você saiu da sua conta.");
    router.push("/");
  }

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

              <div className="mt-8 flex items-center justify-end border-t border-[#e5e7eb] pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
                >
                  <LogOut size={15} /> Sair da Conta
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}