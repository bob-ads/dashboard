import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bcrypt = await import("bcryptjs");

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed completed: admin user created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
