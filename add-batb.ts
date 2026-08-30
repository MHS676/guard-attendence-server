import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Add BATB company
    const batb = await prisma.company.upsert({
      where: { code: 'COMP-003' },
      update: {},
      create: {
        code: 'COMP-003',
        name: 'BATB',
      },
    });

    console.log('✅ BATB Company added/verified:', batb);

    // Get all companies
    const all = await prisma.company.findMany({
      orderBy: { code: 'asc' },
    });

    console.log('\n📊 All Companies in guard-attendance-backend:');
    all.forEach((c) => console.log(`  - ${c.code}: ${c.name}`));

    console.log(`\nTotal companies: ${all.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
