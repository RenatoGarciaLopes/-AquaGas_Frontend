import type { NextConfig } from "next";

/**
 * Hostnames autorizados a carregar `/_next/*` em modo dev quando o app não é aberto como localhost (ex.: `http://192.168.x.x:3000` na rede).
 * Defina NEXT_ALLOWED_DEV_ORIGINS no .env como lista separada por vírgulas; se não existir, usa um valor padrão para LAN típico.
 */
function parseAllowedDevOrigins(): string[] | undefined {
  const env = process.env.NEXT_ALLOWED_DEV_ORIGINS;
  if (env !== undefined) {
    const parsed = env
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    return parsed.length ? parsed : undefined;
  }
  return ["175.2.9.225"];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: parseAllowedDevOrigins(),
};

export default nextConfig;
