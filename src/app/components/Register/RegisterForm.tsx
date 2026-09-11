import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LoginField } from "../Login/LoginField";

export function RegisterForm() {
  return (
    <section className="flex min-h-[620px] items-center justify-center px-6 py-12 sm:px-10 lg:min-h-screen lg:px-16">
      <div className="w-full max-w-[404px]">
        <header>
          <h1 className="font-display text-[36px] font-bold tracking-[-.04em] text-[#18202b]">Criar conta</h1>
          <p className="mt-3 max-w-[360px] text-base leading-6 text-[#737a84]">Comece sua jornada de aprendizado acelerado hoje mesmo.</p>
        </header>

        <div className="my-7 flex items-center gap-3.5 text-[10px] font-bold tracking-[.12em] text-[#a5aab1] before:h-px before:flex-1 before:bg-[#edf0f2] after:h-px after:flex-1 after:bg-[#edf0f2]"><span>CADASTRE-SE</span></div>

        <form className="grid gap-5">
          <LoginField label="Usuário" name="username" type="text" placeholder="Seu nome de usuário" />
          <LoginField label="E-mail Acadêmico ou Pessoal" name="email" type="email" placeholder="exemplo@estudante.com" />
          <LoginField label="Senha" name="password" type="password" placeholder="Mínimo 8 caracteres" />
          <button type="submit" className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[#fb7118] text-base font-bold text-white shadow-[0_10px_20px_rgba(251,113,24,.2)] transition hover:bg-[#e9600c]">Criar minha conta <ArrowRight size={18} /></button>
        </form>

        <p className="mt-8 text-center text-[13px] text-[#8b929b]">Já possui uma conta? <Link href="/" className="font-bold text-[#fb7118]">Fazer login</Link></p>
      </div>
    </section>
  );
}
