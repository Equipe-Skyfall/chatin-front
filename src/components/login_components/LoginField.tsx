"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

type LoginFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const LoginField = forwardRef<HTMLInputElement, LoginFieldProps>(
  ({ label, type = "text", name, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const Icon = type === "text" ? UserRound : type === "email" ? Mail : LockKeyhole;

    return (
      <label className="grid gap-2 text-[13px] font-semibold text-[#20242a]" htmlFor={name}>
        <span>{label}</span>
        <span className="relative flex items-center">
          <Icon className="pointer-events-none absolute left-3.5 text-[#a5adb8]" size={15} />
          <input
            id={name}
            name={name}
            ref={ref}
            type={resolvedType}
            className="h-[50px] w-full rounded-[10px] border border-[#e1e5ea] bg-white pl-10 pr-11 text-base text-[#242a31] outline-none transition focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3.5 text-[#a5adb8] transition hover:text-[#fb7118]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </span>
      </label>
    );
  }
);

LoginField.displayName = "LoginField";