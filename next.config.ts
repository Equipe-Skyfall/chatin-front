import type { NextConfig } from "next";

// O serviço externo de auth (auth.skytrack.space) não libera CORS pra
// localhost - navegador bloqueia a chamada direta. Proxy same-origin via
// rewrite (fetch server-side, sem CORS) em vez de chamar o domínio externo
// direto do browser. Ver src/lib/api.ts (AUTH_API_URL usa esse path).
const AUTH_UPSTREAM = process.env.AUTH_API_UPSTREAM || "https://auth.skytrack.space";

const nextConfig: NextConfig = {
  agentRules: false,
  async rewrites() {
    return [{ source: "/api/authsys/:path*", destination: `${AUTH_UPSTREAM}/:path*` }];
  },
};

export default nextConfig;
