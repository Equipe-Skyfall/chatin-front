import Image from "next/image";
import { LoginBrand } from "./LoginBrand";
import { NeuralBackground } from "./NeurauBackgound";

export function LoginAside() {
  return (
    <aside className="relative flex min-h-[460px] flex-col overflow-hidden bg-[#0e0e0e] px-6 py-7 text-white sm:px-10 sm:py-10 lg:min-h-screen">
      <NeuralBackground />

      <LoginBrand />

      <div className="relative z-10 mx-auto mt-12 aspect-[3/4] w-full max-w-[440px] overflow-hidden rounded-[30px] border-[8px] border-white/15 shadow-[0_24px_44px_rgba(0,0,0,.35)] sm:mt-[72px] lg:mt-16">
        <Image
          src="/estudos.png"
          alt="Estudante utilizando a plataforma CHATin"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-6 pb-6 pt-32">
          <span className="text-[11px] font-bold tracking-[.14em] text-[#fb7118]">INTELIGÊNCIA ARTIFICIAL</span>
          <strong className="mt-3 block max-w-[290px] font-display text-[28px] leading-[1.05]">Potencialize seus estudos com IA</strong>
          <p className="mt-3 max-w-[290px] text-[13px] leading-5 text-white/75">Resumos inteligentes, questionários personalizados e trilhas de aprendizagem em um só lugar.</p>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-4 hidden w-full max-w-[440px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[.06] px-6 py-3.5 text-[12px] leading-4 text-white/55 lg:flex">
        <span>Sua jornada de aprendizado começa aqui.</span>
      </div>

      <div className="relative z-10 mt-auto hidden lg:block">
        <div className="mt-7 flex justify-between gap-4 text-[10px] font-bold tracking-[.12em] text-white/35">
          <span>© 2026 CHATIN. TODOS OS DIREITOS RESERVADOS.</span>
        </div>
      </div>
    </aside>
  );
}