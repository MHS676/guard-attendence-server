import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Creating test user for debugging...');

  // Test user ID that matches the app logs
  const testUserId = 'da07a4c0-8bfe-4123-adec-a9cb991fb1eb';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });

    if (existingUser) {
      console.log(`✅ Test user already exists: ${existingUser.email} (${existingUser.id})`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test@2026', 10);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: testUserId,
        employeeId: '1001',
        email: 'test@falconsecurity.com',
        password: hashedPassword,
        name: 'Test Guard',
        role: Role.SECURITY_GUARD,
        isActive: true,
      },
    });

    console.log(`✅ Test user created successfully:`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   Password: Test@2026`);
    console.log(`\n📝 Use these credentials to log in:`);
    console.log(`   Username: 1001 or test@falconsecurity.com`);
    console.log(`   Password: Test@2026`);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
