"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPerfil, type UserProfile } from "@/lib/auth";
import { getMeuXp, type XpResumo } from "@/lib/xp";
import { useSession } from "@/hooks/use_session";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { AppHeader } from "@/components/layout_components/app_header";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./change_password_form";
import { UsersManagement } from "./users_management";

type ProfileTab = "geral" | "seguranca" | "usuarios";

export function ProfilePage() {
  const { user, carregando: carregandoSessao, indisponivel, recarregar } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState<XpResumo | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("geral");

  const loading = carregandoSessao || (user !== null && carregandoPerfil);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (carregandoSessao || !user) return;

    const currentUser = user;
    let ativo = true;

    async function carregarPerfilEXp() {
      const [perfilData, xpData] = await Promise.allSettled([
        getPerfil(currentUser.id),
        getMeuXp(),
      ]);

      if (!ativo) return;

      if (perfilData.status === "fulfilled") {
        setProfile(perfilData.value);
      } else {
        toast.error(getFriendlyErrorMessage(perfilData.reason));
      }

      if (xpData.status === "fulfilled") {
        setXp(xpData.value);
      }

      setCarregandoPerfil(false);
    }

    carregarPerfilEXp();

    return () => {
      ativo = false;
    };
  }, [carregandoSessao, user]);

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Minha Conta" />
        <div className="flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:px-16">
          {loading && <p className="text-[#737a84]">Carregando...</p>}

          {!loading && !profile && (
            <div className="text-[#737a84]">
              <p>
                {indisponivel
                  ? "Não foi possível confirmar sua sessão agora."
                  : "Não foi possível carregar seu perfil."}
              </p>
              {indisponivel && (
                <button
                  type="button"
                  onClick={() => void recarregar()}
                  className="mt-3 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-semibold text-[#18202b] transition hover:bg-[#f9fafb]"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}

          {!loading && profile && (
            <>
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-[#18202b]">Minha Conta</h1>
                <p className="mt-1 text-[#737a84]">Gerencie suas informações pessoais e configurações de segurança.</p>
              </header>

              <div className="mb-6 flex gap-2 border-b border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setActiveTab("geral")}
                  className={
                    activeTab === "geral"
                      ? "border-b-2 border-[#fb7118] px-1 pb-3 text-sm font-semibold text-[#18202b]"
                      : "px-1 pb-3 text-sm font-medium text-[#8b929b] transition hover:text-[#18202b]"
                  }
                >
                  Geral
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("seguranca")}
                  className={
                    activeTab === "seguranca"
                      ? "border-b-2 border-[#fb7118] px-1 pb-3 text-sm font-semibold text-[#18202b]"
                      : "px-1 pb-3 text-sm font-medium text-[#8b929b] transition hover:text-[#18202b]"
                  }
                >
                  Segurança
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("usuarios")}
                    className={
                      activeTab === "usuarios"
                        ? "border-b-2 border-[#fb7118] px-1 pb-3 text-sm font-semibold text-[#18202b]"
                        : "px-1 pb-3 text-sm font-medium text-[#8b929b] transition hover:text-[#18202b]"
                    }
                  >
                    Usuários
                  </button>
                )}
              </div>

              {activeTab === "geral" && (
                <div className="flex flex-col gap-6 lg:flex-row">
                  <ProfileSidebar username={profile.username} createdAt={profile.createdAt} xp={xp} />
                  <ProfileForm profile={profile} onUpdated={setProfile} />
                </div>
              )}

              {activeTab === "seguranca" && <ChangePasswordForm userId={profile.id} />}

              {activeTab === "usuarios" && isAdmin && <UsersManagement currentUserId={profile.id} />}
            </>
          )}
        </div>
      </section>
    </main>
  );
}