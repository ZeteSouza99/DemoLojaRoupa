/**
 * Garante que o administrador da demonstração exista com papel SUPER_ADMIN.
 * Idempotente: pode ser executado quantas vezes for necessário.
 *
 *   npm run users:admins
 *
 * Senhas via ambiente (obrigatórias e fortes para criar usuários novos):
 *   SEED_ADMIN_PASSWORD (SEED_ADMIN_EMAIL é opcional)
 * A senha só é gravada na CRIAÇÃO — usuários já existentes não têm a senha alterada.
 * Quem é criado aqui precisa trocar a senha no primeiro acesso.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { ensureDemoAdmin } from "./seed-admin";

config({ path: ".env.local" });
config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  await ensureDemoAdmin(prisma);

  const total = await prisma.user.count({ where: { role: "SUPER_ADMIN", deletedAt: null } });
  console.log(`\nAdministradores ativos que recebem aprovação de desconto: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
