import { describe, expect, it } from "vitest";
import {
  changePasswordApiSchema,
  changePasswordFormSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";
import { profileSchema } from "@/lib/validation/profile";

function primeiraMensagem(resultado: { success: boolean; error?: { issues: { message: string }[] } }) {
  return resultado.error?.issues[0]?.message;
}

describe("loginSchema (formulário de login)", () => {
  it("aceita e-mail e senha válidos", () => {
    expect(loginSchema.safeParse({ email: "aluno@chatin.com", password: "12345678" }).success).toBe(true);
  });

  it("exige e-mail preenchido", () => {
    expect(primeiraMensagem(loginSchema.safeParse({ email: "", password: "12345678" }))).toBe("Informe seu e-mail");
  });

  it("rejeita e-mail mal formatado", () => {
    expect(primeiraMensagem(loginSchema.safeParse({ email: "aluno@", password: "12345678" }))).toBe("E-mail inválido");
  });

  it("exige senha com no mínimo 8 caracteres", () => {
    expect(primeiraMensagem(loginSchema.safeParse({ email: "a@b.com", password: "1234567" }))).toBe(
      "A senha deve ter no mínimo 8 caracteres"
    );
  });

  it("descarta campos extras", () => {
    const resultado = loginSchema.parse({ email: "a@b.com", password: "12345678", role: "ADMIN" });
    expect(resultado).toEqual({ email: "a@b.com", password: "12345678" });
  });
});

describe("registerSchema (formulário de cadastro)", () => {
  const valido = { username: "ana", email: "ana@chatin.com", password: "senhaforte" };

  it("aceita dados válidos", () => {
    expect(registerSchema.safeParse(valido).success).toBe(true);
  });

  it("exige usuário com no mínimo 3 caracteres", () => {
    expect(primeiraMensagem(registerSchema.safeParse({ ...valido, username: "an" }))).toBe(
      "O usuário deve ter no mínimo 3 caracteres"
    );
  });

  it("descarta tentativa de enviar `role` pelo cadastro (mass assignment)", () => {
    expect(registerSchema.parse({ ...valido, role: "ADMIN" })).not.toHaveProperty("role");
  });
});

describe("changePasswordFormSchema (troca de senha no perfil)", () => {
  const valido = { currentPassword: "atual123", newPassword: "novaSenha1", confirmPassword: "novaSenha1" };

  it("aceita quando a confirmação confere", () => {
    expect(changePasswordFormSchema.safeParse(valido).success).toBe(true);
  });

  it("aponta o erro no campo de confirmação quando as senhas não coincidem", () => {
    const resultado = changePasswordFormSchema.safeParse({ ...valido, confirmPassword: "outra" });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });
  });

  it("exige nova senha com no mínimo 8 caracteres", () => {
    const resultado = changePasswordFormSchema.safeParse({ ...valido, newPassword: "curta", confirmPassword: "curta" });
    expect(primeiraMensagem(resultado)).toBe("A nova senha deve ter no mínimo 8 caracteres");
  });

  it("o payload da API não carrega a confirmação", () => {
    expect(changePasswordApiSchema.parse(valido)).toEqual({
      currentPassword: "atual123",
      newPassword: "novaSenha1",
    });
  });
});

describe("profileSchema (edição de perfil)", () => {
  it("aceita dados válidos e descarta campos extras", () => {
    expect(profileSchema.parse({ username: "ana", email: "ana@chatin.com", role: "ADMIN" })).toEqual({
      username: "ana",
      email: "ana@chatin.com",
    });
  });

  it("rejeita e-mail inválido", () => {
    expect(primeiraMensagem(profileSchema.safeParse({ username: "ana", email: "x" }))).toBe("E-mail inválido");
  });
});
