// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(() => Promise.resolve()),
  limparSessao: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: mocks.toast }));
vi.mock("@/lib/auth", () => ({ login: mocks.login, logout: mocks.logout })); // <-- ADICIONADO AQUI
vi.mock("@/hooks/use_session", () => ({ limparSessao: mocks.limparSessao }));

import { LoginForm } from "@/components/login_components/LoginForm";

function preencher(email: string, senha: string) {
  fireEvent.change(screen.getByPlaceholderText("exemplo@estudante.com"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: senha } });
}

const botaoEntrar = () => screen.getByRole("button", { name: /Entrar na Plataforma|Entrando/ });

/** A validação do react-hook-form é assíncrona; espera ela terminar. */
async function aguardarValidacao() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

beforeEach(() => {
  mocks.login.mockReset();
});

describe("LoginForm (tela de login)", () => {
  it("com dados válidos faz login, limpa a sessão em cache e vai para /inicio", async () => {
    mocks.login.mockResolvedValue({ success: true });
    render(<LoginForm />);

    preencher("ana@chatin.com", "senhaforte");
    fireEvent.click(botaoEntrar());

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/inicio"));
    expect(mocks.login).toHaveBeenCalledWith({ email: "ana@chatin.com", password: "senhaforte" });
    expect(mocks.limparSessao).toHaveBeenCalled();
    expect(mocks.toast.success).toHaveBeenCalledWith("Login realizado com sucesso!");
  });

  it("não chama a API com e-mail inválido ou senha curta", async () => {
    render(<LoginForm />);

    preencher("ana@", "123");
    fireEvent.click(botaoEntrar());
    await aguardarValidacao();

    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("avisa o usuário quando o formulário é inválido", async () => {
    render(<LoginForm />);

    preencher("ana@chatin.com", "123");
    fireEvent.click(botaoEntrar());

    await waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("A senha deve ter no mínimo 8 caracteres")
    );
  });

  it("mostra mensagem amigável quando as credenciais estão erradas", async () => {
    mocks.login.mockRejectedValue(new ApiError("Invalid credentials", 401));
    render(<LoginForm />);

    preencher("ana@chatin.com", "senhaerrada");
    fireEvent.click(botaoEntrar());

    await waitFor(() => expect(mocks.toast.error).toHaveBeenCalledWith("E-mail ou senha incorretos."));
    expect(mocks.push).not.toHaveBeenCalled();
    expect(botaoEntrar()).not.toBeDisabled();
  });

  it("desabilita o botão enquanto o login está em andamento (evita duplo envio)", async () => {
    let concluir!: () => void;
    mocks.login.mockReturnValue(new Promise<void>((resolve) => (concluir = resolve)));
    render(<LoginForm />);

    preencher("ana@chatin.com", "senhaforte");
    fireEvent.click(botaoEntrar());

    await waitFor(() => expect(botaoEntrar()).toBeDisabled());
    expect(botaoEntrar()).toHaveTextContent("Entrando...");

    concluir();
    await waitFor(() => expect(mocks.push).toHaveBeenCalled());
  });

  it("permite mostrar e ocultar a senha", () => {
    render(<LoginForm />);
    const senha = screen.getByPlaceholderText("Mínimo 8 caracteres");

    expect(senha).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(senha).toHaveAttribute("type", "password");
  });

  it("tem link para a tela de cadastro", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
  });
});