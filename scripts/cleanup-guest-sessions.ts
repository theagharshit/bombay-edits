import { GuestSessionModel } from '../src/backend/models/guestSessionModel';
import { prisma } from '../src/backend/db/prisma';

async function main() {
  console.log('====================================================');
  console.log('🧹 RUNNING 30-DAY INACTIVE GUEST SESSION CLEANUP');
  console.log('====================================================');

  const beforeCount = await prisma.guestSession.count();
  console.log(`Current guest sessions in database: ${beforeCount}`);

  const { deletedCount } = await GuestSessionModel.cleanupExpiredSessions();
  console.log(`Deleted ${deletedCount} guest session(s) with >30 days of inactivity.`);

  const afterCount = await prisma.guestSession.count();
  console.log(`Remaining active guest sessions: ${afterCount}`);
  console.log('Clean up completed successfully.\n');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
