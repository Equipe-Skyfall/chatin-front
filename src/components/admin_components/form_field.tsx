"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const labelClassName = "text-[9px] font-bold uppercase tracking-[0.14em] text-gray";
const controlClassName =
  "w-full rounded-[8px] border border-line bg-white px-2 py-2 text-[12px] text-charcoal outline-none transition focus:border-orange disabled:opacity-50";

export const primaryButtonClassName =
  "rounded-[8px] w-full bg-orange-light px-3 py-1.5 text-[10px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50";
export const ghostButtonClassName =
  "rounded-[8px] border w-full border-line px-3 py-1.5 text-[10px] font-semibold text-gray transition-colors hover:border-orange hover:text-orange disabled:opacity-50 disabled:hover:border-line disabled:hover:text-gray";
export const iconButtonClassName =
  "flex h-7 w-7 items-center w-full justify-center rounded-[8px] text-gray transition-colors hover:bg-orange/10 hover:text-orange disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray";

export function TextField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1">
      <span className={labelClassName}>{label}</span>
      <input className={controlClassName} {...props} />
    </label>
  );
}

export function TextAreaField({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-1">
      <span className={labelClassName}>{label}</span>
      <textarea className={`${controlClassName} resize-y leading-[1.5]`} {...props} />
    </label>
  );
}
