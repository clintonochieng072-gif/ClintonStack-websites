import { PrismaClient } from './src/generated/client.js';

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`Deleted ${deletedUsers.count} users from PostgreSQL`);
  } catch (error) {
    console.error('Error deleting users from PostgreSQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();