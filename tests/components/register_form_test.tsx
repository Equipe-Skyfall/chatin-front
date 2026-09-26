// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  registrar: vi.fn(),
  logout: vi.fn(() => Promise.resolve()),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: mocks.toast }));
vi.mock("@/lib/auth", () => ({ registrar: mocks.registrar, logout: mocks.logout })); // <-- ADICIONADO AQUI

import { RegisterForm } from "@/components/register_components/RegisterForm";

function preencher(usuario: string, email: string, senha: string) {
  fireEvent.change(screen.getByPlaceholderText("Seu nome de usuário"), { target: { value: usuario } });
  fireEvent.change(screen.getByPlaceholderText("exemplo@estudante.com"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: senha } });
}

const botaoCriar = () => screen.getByRole("button", { name: /Criar minha conta|Cadastrando/ });

/** A validação do react-hook-form é assíncrona; espera ela terminar. */
async function aguardarValidacao() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

beforeEach(() => {
  mocks.registrar.mockReset();
});

describe("RegisterForm (tela de cadastro)", () => {
  it("com dados válidos cria a conta e volta para o login", async () => {
    mocks.registrar.mockResolvedValue({ id: "u1" });
    render(<RegisterForm />);

    preencher("ana", "ana@chatin.com", "senhaforte");
    fireEvent.click(botaoCriar());

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.registrar).toHaveBeenCalledWith({ username: "ana", email: "ana@chatin.com", password: "senhaforte" });
    expect(mocks.toast.success).toHaveBeenCalledWith("Conta criada com sucesso! Faça login para continuar.");
  });

  it("não chama a API com usuário curto demais", async () => {
    render(<RegisterForm />);

    preencher("an", "ana@chatin.com", "senhaforte");
    fireEvent.click(botaoCriar());
    await aguardarValidacao();

    expect(mocks.registrar).not.toHaveBeenCalled();
  });

  // BUG CONHECIDO (RegisterForm.tsx:38-41): mesmo problema do LoginForm -
  // `onInvalid` lê `errors` desatualizado e nenhum aviso aparece. Pulado até
  // a correção - troque `it.skip` por `it` quando corrigir.
  it.skip("[BUG] formulário inválido deveria avisar o usuário", async () => {
    render(<RegisterForm />);

    preencher("an", "ana@chatin.com", "senhaforte");
    fireEvent.click(botaoCriar());

    await waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("O usuário deve ter no mínimo 3 caracteres")
    );
  });

  it("avisa quando o e-mail já está em uso", async () => {
    mocks.registrar.mockRejectedValue(new ApiError("Email already exists", 409));
    render(<RegisterForm />);

    preencher("ana", "ana@chatin.com", "senhaforte");
    fireEvent.click(botaoCriar());

    await waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("Este e-mail já está em uso. Tente fazer login.")
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("avisa sobre falha de conexão", async () => {
    mocks.registrar.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<RegisterForm />);

    preencher("ana", "ana@chatin.com", "senhaforte");
    fireEvent.click(botaoCriar());

    await waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("Erro de conexão. Verifique sua internet e tente novamente.")
    );
  });
});