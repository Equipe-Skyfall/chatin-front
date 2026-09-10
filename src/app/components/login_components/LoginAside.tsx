import { BookOpen } from "lucide-react";
import { LoginBrand } from "./LoginBrand";

export function LoginAside() {
  return (
    <aside className="relative flex min-h-[460px] flex-col overflow-hidden bg-[#171717] px-6 py-7 text-white sm:px-10 sm:py-10 lg:min-h-screen">
      <div className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-[#2d211a] blur-3xl" />
      <LoginBrand />

      <div className="relative z-10 mx-auto mt-12 aspect-[.88] w-full max-w-[378px] overflow-hidden rounded-[30px] border-[8px] border-white/15 bg-[#df8d6b] shadow-[0_24px_44px_rgba(0,0,0,.35)] sm:mt-[72px] lg:mt-16">
        <div className="absolute inset-x-0 top-0 h-[58%] bg-[#efb39d]" />
        <div className="absolute left-[12%] top-[13%] h-20 w-10 rotate-[-28deg] rounded-full bg-[#a84737]" />
        <div className="absolute right-[14%] top-[36%] size-12 rounded-full bg-[#c65f3d]" />
        <div className="absolute left-1/2 top-[8%] size-36 -translate-x-1/2 rounded-[45%] bg-[#2b2430] shadow-[inset_18px_-8px_0_#403342] sm:size-44" />
        <div className="absolute left-1/2 top-[24%] h-32 w-28 -translate-x-1/2 rounded-[42%] bg-[#f2c0a3] sm:h-36 sm:w-32" />
        <div className="absolute left-1/2 top-[31%] flex -translate-x-1/2 gap-7 text-[#32222b] sm:gap-9"><span className="h-3 w-8 rounded-full border-2 border-[#32222b]" /><span className="h-3 w-8 rounded-full border-2 border-[#32222b]" /></div>
        <div className="absolute left-1/2 top-[47%] h-20 w-48 -translate-x-1/2 rotate-[-5deg] rounded-t-[14px] bg-[#c65b3a] sm:h-24 sm:w-56" />
        <div className="absolute bottom-[18%] left-1/2 z-10 flex h-28 w-48 -translate-x-1/2 rotate-[-6deg] items-center justify-center rounded-md bg-[#234353] shadow-[0_8px_0_#142632] sm:w-56"><BookOpen size={58} strokeWidth={1.5} className="text-[#a9ced0]" /></div>
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-6 pb-6 pt-24">
          <span className="text-[9px] font-bold tracking-[.14em] text-[#fb7118]">INTELIGÊNCIA ARTIFICIAL</span>
          <strong className="mt-3 block max-w-[290px] font-display text-[25px] leading-[1.05]">Potencialize seus estudos com IA</strong>
          <p className="mt-3 max-w-[290px] text-[11px] leading-5 text-white/75">Resumos inteligentes, questionários personalizados e trilhas de aprendizagem em um só lugar.</p>
        </div>
      </div>

      <div className="relative z-10 mt-auto hidden lg:block">
        <div className="mt-12 flex max-w-[270px] items-center gap-2 rounded-[18px] border border-white/10 bg-white/[.06] px-4 py-3.5 text-[10px] leading-4 text-white/55"><span className="flex -space-x-2 text-[#fb7118]"><span className="grid size-7 place-items-center rounded-full border-2 border-[#27211d] bg-[#e9b49a]">●</span><span className="grid size-7 place-items-center rounded-full border-2 border-[#27211d] bg-[#4e8291]">●</span><span className="grid size-7 place-items-center rounded-full border-2 border-[#27211d] bg-[#d9a54d]">●</span></span><span>Junte-se a mais de <strong className="text-white">10.000+ estudantes</strong> na plataforma.</span></div>
        <div className="mt-7 flex justify-between gap-4 text-[8px] font-bold tracking-[.12em] text-white/35"><span>© 2024 CHATIN. TODOS OS DIREITOS RESERVADOS.</span><span>PRIVACIDADE&nbsp;&nbsp; TERMOS</span></div>
      </div>
    </aside>
  );
}