import { PrismaClient, OrganizationRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "admin@supportai.com",
    },
    update: {},
    create: {
      name: "Support AI Admin",
      email: "admin@supportai.com",
      passwordHash,
    },
  });

  const organization = await prisma.organization.upsert({
    where: {
      slug: "demo-organization",
    },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo-organization",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {
      role: OrganizationRole.OWNER,
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: OrganizationRole.OWNER,
    },
  });

  console.log("✅ Seed completed");
  console.log(`Admin: ${user.email}`);
  console.log(`Organization: ${organization.name}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });