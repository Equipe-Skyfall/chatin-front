import Image from "next/image";
import Link from "next/link";

export function LoginBrand() {
  return (
    <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white">
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-[#b65310]">
        <Image
          src="/chatinlogo.png"
          alt="Logo CHATin"
          fill
          className="object-cover"
        />
      </span>
      <span>CHAT<span className="text-[#fb7118]">in</span></span>
    </Link>
  );
}