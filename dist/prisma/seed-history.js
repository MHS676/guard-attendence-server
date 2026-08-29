"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString)
    throw new Error('DATABASE_URL missing');
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
function buildCheckInTime(date, hours, minutes) {
    const checkInTime = new Date(date);
    checkInTime.setUTCHours(hours, minutes, 0, 0);
    return checkInTime;
}
async function main() {
    console.log('Attaching attendance history to all users in database...');
    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();
    if (users.length === 0) {
        console.log('No users found in database. Run main seed first.');
        return;
    }
    let post = posts[0];
    if (!post) {
        const defaultCompany = await prisma.company.upsert({
            where: { code: 'COMP-001' },
            update: {},
            create: {
                code: 'COMP-001',
                name: 'Falcon Security HQ',
            },
        });
        post = await prisma.post.create({
            data: {
                name: 'Main HQ Gate',
                code: 'HQ-01',
                latitude: 23.8103,
                longitude: 90.4125,
                companyId: defaultCompany.id,
            },
        });
    }
    const coordinator = users.find((u) => u.role === 'COORDINATOR') || users[0];
    const attendanceData = [];
    const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT'];
    for (const user of users) {
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            attendanceData.push({
                userId: user.id,
                markedById: coordinator.id,
                postId: post.id,
                date: date,
                checkInTime: buildCheckInTime(date, 8, i),
                shiftHours: 8,
                status: statuses[i % statuses.length],
                captureLatitude: post.latitude || 23.8103,
                captureLongitude: post.longitude || 90.4125,
            });
        }
    }
    await prisma.attendance.deleteMany();
    await prisma.attendance.createMany({ data: attendanceData });
    console.log(`Successfully created ${attendanceData.length} attendance records across ${users.length} user(s)!`);
}
main()
    .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed-history.js.map