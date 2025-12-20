import { prisma } from '../src/lib/prisma';
import { usersRepo } from '../src/repositories/usersRepo';

async function fixAffiliateReferralCodes() {
  try {
    console.log('Starting to fix affiliate referral codes...');

    // Get all affiliates
    const affiliates = await prisma.user.findMany({
      where: { role: 'affiliate' },
      select: { id: true, email: true, referralCode: true, createdAt: true }
    });

    console.log(`Found ${affiliates.length} affiliates`);

    let fixedCount = 0;

    for (const affiliate of affiliates) {
      if (!affiliate.referralCode || affiliate.referralCode.trim() === '') {
        try {
          console.log(`Generating referral code for ${affiliate.email}...`);
          const newReferralCode = await usersRepo.generateUniqueReferralCode();

          await usersRepo.update(affiliate.id, { referralCode: newReferralCode });

          console.log(`✓ Updated ${affiliate.email} with referral code: ${newReferralCode}`);
          fixedCount++;
        } catch (error) {
          console.error(`✗ Failed to generate referral code for ${affiliate.email}:`, error);
        }
      } else {
        console.log(`- ${affiliate.email} already has referral code: ${affiliate.referralCode}`);
      }
    }

    console.log(`\nCompleted! Fixed ${fixedCount} affiliates.`);

  } catch (error) {
    console.error('Error fixing referral codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixAffiliateReferralCodes()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { fixAffiliateReferralCodes };