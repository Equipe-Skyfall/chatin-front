import { LoginAside } from "../../components/login_components/LoginAside";
import { LoginForm } from "../../components/login_components/LoginForm";

export function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-white text-[#1d252d] lg:grid-cols-[45%_55%]">
      <LoginAside />
      <LoginForm />
    </main>
  );
}