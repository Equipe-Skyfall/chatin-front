import { LoginAside } from "../Login/LoginAside";
import { RegisterForm } from "./RegisterForm";

export function RegisterPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-white text-[#1d252d] lg:grid-cols-[45%_55%]">
      <LoginAside />
      <RegisterForm />
    </main>
  );
}
