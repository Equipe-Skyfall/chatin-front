import { describe, expect, it } from "vitest";
import { apelidoValido } from "@/lib/apelido";

describe("apelidoValido", () => {
  it.each(["Ana", "Ana Lu", "joão_2", "a.b-c", "  Ana   Lu "])("aceita %j", (apelido) => {
    expect(apelidoValido(apelido)).toBe(true);
  });

  it.each(["", "ab", "x".repeat(21), "ana@gmail.com", "a/b/c", "   "])("recusa %j", (apelido) => {
    expect(apelidoValido(apelido)).toBe(false);
  });
});
