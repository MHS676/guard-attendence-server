import 'dotenv/config';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

interface GuardProfileExcelRow {
  'User Name'?: string;
  'User Code'?: string;
  Mobile?: string | number;
  Designation?: string;
  JoiningDate?: string | number | Date;
  'User Role Name'?: string;
  Territory?: string;
  TerritiryCode?: string;
  [key: string]: unknown;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseJoiningDate(value: GuardProfileExcelRow['JoiningDate']) {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'number') {
    const parsed = xlsx.SSF.parse_date_code(value);

    if (!parsed) {
      return null;
    }

    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeMobile(value: GuardProfileExcelRow['Mobile']) {
  if (value == null) {
    return null;
  }

  const mobile = String(value).trim().replace(/[^0-9+]/g, '');
  return mobile || null;
}

function resolveRole(designation: string) {
  const lowered = designation.toLowerCase();

  if (lowered.includes('manager') || lowered.includes('supervisor') || lowered.includes('in charge')) {
    return Role.SECURITY_SUPERVISOR;
  }

  return Role.SECURITY_GUARD;
}

async function importGuardProfiles() {
  const filePath = path.join(process.cwd(), 'Robi SFA 340 User Format(8) Information New.xlsx');

  console.log(`Reading guard profiles from: ${filePath}`);

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null,
  });

  if (!rawData.length) {
    console.log('No data found in the Excel sheet.');
    return;
  }

  const robiCompany = await prisma.company.upsert({
    where: { name: 'Robi' },
    update: {},
    create: {
      code: 'COMP-002',
      name: 'Robi',
    },
  });

  let importedCount = 0;
  let skippedCount = 0;

  for (const rawRow of rawData) {
    // Trim spaces from header keys (e.g., 'User Code ' -> 'User Code')
    const row: GuardProfileExcelRow = {};
    for (const [key, val] of Object.entries(rawRow)) {
      row[key.trim()] = val;
    }

    const rawName = row['User Name'];
    const rawUserCode = row['User Code'];

    if (!rawName || !rawUserCode) {
      skippedCount++;
      continue;
    }

    const name = String(rawName).trim();
    const employeeId = String(rawUserCode).trim();
    const designation = String(row.Designation || 'Security Guard').replace(/\$\$/g, '').trim();
    const userRole = row['User Role Name'] ? String(row['User Role Name']).trim() : null;
    const territory = (row.Territory || row.TerritiryCode) ? String(row.Territory || row.TerritiryCode).trim() : null;
    const mobile = normalizeMobile(row.Mobile);
    const joiningDate = parseJoiningDate(row.JoiningDate);
    const role = resolveRole(designation);

    const user = await prisma.user.upsert({
      where: { employeeId },
      update: {
        name,
        role,
      },
      create: {
        employeeId,
        email: `${employeeId.toLowerCase()}@robi.com`,
        password: 'Password123!',
        name,
        role,
      },
    });

    await prisma.guardProfile.upsert({
      where: { userId: user.id },
      update: {
        userCode: employeeId,
        mobile,
        designation,
        userRole,
        territory,
        joiningDate,
        companyId: robiCompany.id,
      },
      create: {
        userId: user.id,
        userCode: employeeId,
        mobile,
        designation,
        userRole,
        territory,
        joiningDate,
        companyId: robiCompany.id,
      },
    });

    importedCount++;
  }

  console.log(`Imported ${importedCount} guard profiles into GuardProfile.`);
  console.log(`Skipped ${skippedCount} rows without User Name or User Code.`);
}

importGuardProfiles()
  .catch((error) => {
    console.error('Guard profile import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });