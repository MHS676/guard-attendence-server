import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function buildCheckInTime(date: Date, hours: number, minutes: number) {
  const checkInTime = new Date(date);
  checkInTime.setUTCHours(hours, minutes, 0, 0);
  return checkInTime;
}

async function main() {
  console.log('Attaching attendance history to all users in database...');

  // 1. Fetch all users and posts
  const users = await prisma.user.findMany();
  const posts = await prisma.post.findMany();

  if (users.length === 0) {
    console.log('No users found in database. Run main seed first.');
    return;
  }

  // Ensure a default company exists if fallback post creation is needed
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
        companyId: defaultCompany.id, // Linked required company relation
      },
    });
  }

  const coordinator = users.find((u) => u.role === 'COORDINATOR') || users[0];

  // 2. Generate records for each user across the past 5 days
  const attendanceData = [];
  const statuses: ('PRESENT' | 'LATE')[] = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT'];

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

  // 3. Clear existing and bulk insert fresh records
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
