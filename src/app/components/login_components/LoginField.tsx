import { Eye, LockKeyhole, Mail } from "lucide-react";

type LoginFieldProps = {
  label: string;
  name: string;
  type: "email" | "password";
  placeholder: string;
};

export function LoginField({ label, name, type, placeholder }: LoginFieldProps) {
  const Icon = type === "email" ? Mail : LockKeyhole;

  return (
    <label className="grid gap-2 text-[11px] font-semibold text-[#20242a]" htmlFor={name}>
      <span>{label}</span>
      <span className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3.5 text-[#a5adb8]" size={15} />
        <input id={name} name={name} type={type} placeholder={placeholder} required className="h-[46px] w-full rounded-[10px] border border-[#e1e5ea] bg-white pl-10 pr-11 text-sm text-[#242a31] outline-none transition focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10" />
        {type === "password" && <button type="button" aria-label="Mostrar senha" className="absolute right-3.5 text-[#a5adb8]"><Eye size={15} /></button>}
      </span>
    </label>
  );
}