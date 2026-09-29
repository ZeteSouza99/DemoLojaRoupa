/**
 * Identidade visual por cliente (whitelabel).
 * Cada deploy define suas variáveis NEXT_PUBLIC_BRAND_* no ambiente.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Demo Loja",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Ambiente de demonstração",
  logo: process.env.NEXT_PUBLIC_BRAND_LOGO ?? "/demo-logo.svg",
} as const;
