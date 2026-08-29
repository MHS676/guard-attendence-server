"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🚀 Creating test user for debugging...');
    const testUserId = 'da07a4c0-8bfe-4123-adec-a9cb991fb1eb';
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: testUserId },
        });
        if (existingUser) {
            console.log(`✅ Test user already exists: ${existingUser.email} (${existingUser.id})`);
            return;
        }
        const hashedPassword = await bcrypt.hash('Test@2026', 10);
        const testUser = await prisma.user.create({
            data: {
                id: testUserId,
                employeeId: '1001',
                email: 'test@falconsecurity.com',
                password: hashedPassword,
                name: 'Test Guard',
                role: client_1.Role.SECURITY_GUARD,
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
    }
    catch (error) {
        console.error('❌ Error creating test user:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=seed-test-user.js.map