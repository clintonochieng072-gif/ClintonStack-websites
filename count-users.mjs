import { PrismaClient } from "./src/generated/client.js";

const prisma = new PrismaClient();

async function countUsers() {
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in PostgreSQL: ${userCount}`);
  } catch (error) {
    console.error("Error counting users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

countUsers();
