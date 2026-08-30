"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const batb = await prisma.company.upsert({
            where: { code: 'COMP-003' },
            update: {},
            create: {
                code: 'COMP-003',
                name: 'BATB',
            },
        });
        console.log('✅ BATB Company added/verified:', batb);
        const all = await prisma.company.findMany({
            orderBy: { code: 'asc' },
        });
        console.log('\n📊 All Companies in guard-attendance-backend:');
        all.forEach((c) => console.log(`  - ${c.code}: ${c.name}`));
        console.log(`\nTotal companies: ${all.length}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=add-batb.js.map