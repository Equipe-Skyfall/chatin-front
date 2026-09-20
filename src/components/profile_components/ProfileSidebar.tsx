"use client";

interface ProfileSidebarProps {
  username: string;
  createdAt: string;
}

export function ProfileSidebar({ username, createdAt }: ProfileSidebarProps) {
  const initial = username.charAt(0).toUpperCase();
  const memberSince = new Date(createdAt).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-[280px] rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-24 place-items-center rounded-full bg-[#e4defe] text-3xl font-bold text-[#6d5bd0]">
          {initial}
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#18202b]">{username}</h2>
        <span className="mt-1 rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#6b7280]">
          Membro desde {memberSince}
        </span>
      </div>
    </div>
  );
}