import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedPassword } from "./seed-password";

/** Preserva a senha de uma conta existente e exige troca no primeiro acesso de contas novas. */
export async function ensureDemoAdmin(prisma: PrismaClient): Promise<void> {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@demolojaroupa.local").trim().toLowerCase();
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Demo Loja Roupa";
  const name = `Administrador ${brandName}`;

  if (!email || !email.includes("@")) {
    throw new Error("SEED_ADMIN_EMAIL: defina um endereço de e-mail válido.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name, role: "SUPER_ADMIN", isActive: true, deletedAt: null },
    });
    console.log(`↻ SUPER_ADMIN pronto (senha preservada): ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(seedPassword("SEED_ADMIN_PASSWORD"), 12),
      role: "SUPER_ADMIN",
      mustChangePassword: true,
    },
  });
  console.log(`✅ SUPER_ADMIN criado: ${email}`);
}
