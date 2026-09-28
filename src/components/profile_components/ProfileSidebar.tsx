"use client";

import { calcularProgressoNivel, type XpResumo } from "@/lib/xp";

interface ProfileSidebarProps {
  username: string;
  createdAt: string;
  xp: XpResumo | null;
}

export function ProfileSidebar({ username, createdAt, xp }: ProfileSidebarProps) {
  const initial = username.charAt(0).toUpperCase();
  const memberSince = new Date(createdAt).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  const progresso = xp ? calcularProgressoNivel(xp) : 0;

  return (
    <div className="w-full max-w-[280px] rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-24 place-items-center rounded-full bg-[#e4defe] text-3xl font-bold text-[#6d5bd0]">
          {initial}
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#18202b]">{username}</h2>

        <div className="mt-2 flex items-center gap-2">
          {xp && (
            <span className="rounded-full bg-[#fef1e6] px-3 py-1 text-xs font-semibold text-[#fb7118]">
              Level {xp.nivel}
            </span>
          )}
          <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#6b7280]">
            Membro desde {memberSince}
          </span>
        </div>
      </div>

      {xp && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#8b929b]">Progresso do Nível</span>
            <span className="font-bold text-[#fb7118]">{progresso}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-[#edf0f2]">
            <div
              className="h-2 rounded-full bg-[#fb7118] transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}