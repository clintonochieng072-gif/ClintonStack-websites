import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetExpiredSubscriptions() {
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      plan: {
        type: 'subscription'
      },
      currentPeriodEnd: {
        lt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  for (const sub of expiredSubscriptions) {
    await prisma.user.update({
      where: { id: sub.userId },
      data: { has_paid: false }
    });
  }

  console.log(`Reset hasPaid for ${expiredSubscriptions.length} users`);
}

resetExpiredSubscriptions().catch(console.error).finally(() => prisma.$disconnect());