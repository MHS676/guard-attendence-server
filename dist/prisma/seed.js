"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const xlsx = require("xlsx");
const path = require("path");
const dotenv = require("dotenv");
const axios_1 = require("axios");
const bcrypt = require("bcrypt");
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const AREA_COORDINATE_MAP = {
    patuakhali: { lat: 22.3596, lng: 90.3299 },
    barguna: { lat: 22.157, lng: 90.126 },
    bagerhat: { lat: 22.6516, lng: 89.7859 },
    barishal: { lat: 22.701, lng: 90.3535 },
    barisal: { lat: 22.701, lng: 90.3535 },
    bhola: { lat: 22.6859, lng: 90.6482 },
    jhalakathi: { lat: 22.6406, lng: 90.1987 },
    pirojpur: { lat: 22.5841, lng: 89.972 },
    gopalganj: { lat: 23.005, lng: 89.8266 },
    faridpur: { lat: 23.607, lng: 89.8429 },
    madaripur: { lat: 23.1641, lng: 90.1897 },
    rajbari: { lat: 23.7574, lng: 89.6444 },
    shariatpur: { lat: 23.2423, lng: 90.4348 },
    khulna: { lat: 22.8456, lng: 89.5403 },
    jashore: { lat: 23.1664, lng: 89.2081 },
    jessore: { lat: 23.1664, lng: 89.2081 },
    satkhira: { lat: 22.7185, lng: 89.0705 },
    jhenaidah: { lat: 23.5448, lng: 89.1539 },
    magura: { lat: 23.4873, lng: 89.4199 },
    chuadanga: { lat: 23.6401, lng: 88.8418 },
    meherpur: { lat: 23.7622, lng: 88.6318 },
    narail: { lat: 23.1725, lng: 89.5127 },
    kushtia: { lat: 23.9013, lng: 89.1204 },
    kustia: { lat: 23.9013, lng: 89.1204 },
    rajshahi: { lat: 24.3745, lng: 88.6042 },
    bogura: { lat: 24.8465, lng: 89.3777 },
    bogra: { lat: 24.8465, lng: 89.3777 },
    natore: { lat: 24.4102, lng: 89.0076 },
    pabna: { lat: 24.0114, lng: 89.2503 },
    sirajganj: { lat: 24.4534, lng: 89.7008 },
    dinajpur: { lat: 25.6279, lng: 88.6332 },
    gaibandha: { lat: 25.3287, lng: 89.542 },
    kurigram: { lat: 25.8054, lng: 89.6361 },
    lalmonirhat: { lat: 25.9159, lng: 89.4526 },
    nilphamari: { lat: 25.9312, lng: 88.856 },
    panchagarh: { lat: 26.3411, lng: 88.5542 },
    rangpur: { lat: 25.7439, lng: 89.2752 },
    thakurgaon: { lat: 26.0337, lng: 88.4617 },
    mymensingh: { lat: 24.7471, lng: 90.4203 },
    jamalpur: { lat: 24.9375, lng: 89.9377 },
    netrokona: { lat: 24.8703, lng: 90.7279 },
    sherpur: { lat: 25.0204, lng: 90.0153 },
    tangail: { lat: 24.2513, lng: 89.9167 },
    chandpur: { lat: 23.2321, lng: 90.6631 },
    feni: { lat: 23.0159, lng: 91.3976 },
    lakshmipur: { lat: 22.9447, lng: 90.8282 },
    noakhali: { lat: 22.8696, lng: 91.0993 },
    baridhara: { lat: 23.8068, lng: 90.4156 },
    dhanmondi: { lat: 23.7461, lng: 90.3742 },
    gulshan: { lat: 23.7925, lng: 90.4078 },
    banani: { lat: 23.7937, lng: 90.4066 },
    uttara: { lat: 23.8759, lng: 90.3795 },
    mirpur: { lat: 23.8069, lng: 90.3687 },
    motijheel: { lat: 23.733, lng: 90.4172 },
    mohakhali: { lat: 23.7778, lng: 90.4055 },
    bashundhara: { lat: 23.8191, lng: 90.4526 },
    narayanganj: { lat: 23.6238, lng: 90.5 },
    chittagong: { lat: 22.3569, lng: 91.7832 },
};
const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };
function parseExcelDate(value) {
    if (!value)
        return null;
    if (value instanceof Date && !isNaN(value.getTime()))
        return value;
    if (typeof value === 'number') {
        const parsed = xlsx.SSF.parse_date_code(value);
        if (parsed) {
            return new Date(parsed.y, parsed.m - 1, parsed.d);
        }
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        if (trimmed.includes('/')) {
            const parts = trimmed.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const dateObj = new Date(year, month, day);
                if (!isNaN(dateObj.getTime()))
                    return dateObj;
            }
        }
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime()))
            return parsed;
    }
    return null;
}
function mapBatbRole(desig) {
    const norm = (desig || '').toLowerCase().trim();
    if (norm.includes('supervisor'))
        return client_1.Role.SECURITY_SUPERVISOR;
    if (norm.includes('officer') || norm.includes('insp') || norm.includes('opt')) {
        return client_1.Role.SECURITY_IN_CHARGE;
    }
    return client_1.Role.SECURITY_GUARD;
}
async function fetchCoordinates(address, location) {
    const cleanSearch = `${address || location}, Bangladesh`;
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanSearch)}&limit=1`;
        const res = await axios_1.default.get(url, {
            headers: { 'User-Agent': 'FalconManagementSeeder/1.0' },
            timeout: 3000,
        });
        if (res.data && res.data.length > 0) {
            return {
                lat: parseFloat(res.data[0].lat),
                lng: parseFloat(res.data[0].lon),
            };
        }
    }
    catch (err) {
    }
    const combinedText = `${address} ${location}`.toLowerCase();
    for (const [key, coords] of Object.entries(AREA_COORDINATE_MAP)) {
        if (combinedText.includes(key)) {
            return coords;
        }
    }
    return DEFAULT_CENTER;
}
async function main() {
    console.log('Preserving existing records and executing safe upserts...');
    console.log(`\n--- Seeding Default System Users ---`);
    const defaultUsers = [
        {
            email: 'admin@falconsecurity.com',
            employeeId: '1000',
            password: 'FalconPassword123!',
            name: 'System Admin',
            role: client_1.Role.COORDINATOR,
        },
        {
            email: 'demo@falconsecurity.com',
            employeeId: '1001',
            password: 'Falcon@2026',
            name: 'Demo Guard',
            role: client_1.Role.SECURITY_GUARD,
        },
    ];
    for (const u of defaultUsers) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        const createdUser = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                password: hashedPassword,
                employeeId: u.employeeId,
                role: u.role,
                name: u.name,
            },
            create: {
                email: u.email,
                employeeId: u.employeeId,
                password: hashedPassword,
                name: u.name,
                role: u.role,
            },
        });
        console.log(`✅ Default User Pushed: ${createdUser.email} (ID: ${createdUser.employeeId})`);
    }
    console.log(`\n--- Seeding Demo Client User ---`);
    const clientUserUpsert = await prisma.user.upsert({
        where: { email: 'client@demo.com' },
        update: {
            password: await bcrypt.hash('ClientPass123!', 10),
            employeeId: '2000',
            role: 'CLIENT',
            name: 'Demo Client',
        },
        create: {
            email: 'client@demo.com',
            employeeId: '2000',
            password: await bcrypt.hash('ClientPass123!', 10),
            name: 'Demo Client',
            role: 'CLIENT',
        },
    });
    console.log(`✅ Demo Client ensured: ${clientUserUpsert.email}`);
    const falconCompany = await prisma.company.upsert({
        where: { name: 'Falcon Security Limited' },
        update: {},
        create: {
            code: 'COMP-001',
            name: 'Falcon Security Limited',
        },
    });
    const robiCompany = await prisma.company.upsert({
        where: { name: 'Robi' },
        update: {},
        create: {
            code: 'COMP-002',
            name: 'Robi',
        },
    });
    const batbCompany = await prisma.company.upsert({
        where: { name: 'BATB' },
        update: {},
        create: {
            code: 'COMP-003',
            name: 'BATB',
        },
    });
    let postCount = 0;
    const clientFilePath = path.join(process.cwd(), 'Client List with Address 18.07.2026.xlsx');
    try {
        console.log(`\n--- Seeding Client List under Falcon Security Limited ---`);
        const clientWb = xlsx.readFile(clientFilePath);
        const clientSheet = clientWb.Sheets[clientWb.SheetNames[0]];
        const clientRows = xlsx.utils.sheet_to_json(clientSheet, { range: 3 });
        for (const row of clientRows) {
            const rawPostName = row[' Posts'] || row['Posts'] || row['Client Name'] || row['Name'];
            const rawAddress = row['Address'] || row['Client Address'];
            const rawLocation = row['Locations'] || row['Location'] || '';
            if (!rawPostName || typeof rawPostName !== 'string')
                continue;
            const name = rawPostName.trim();
            if (!name)
                continue;
            const address = rawAddress && String(rawAddress).trim() !== '' ? String(rawAddress).trim() : null;
            const location = String(rawLocation).trim();
            postCount++;
            const postCode = `POST-${String(postCount).padStart(3, '0')}`;
            const coords = await fetchCoordinates(address || '', location);
            await prisma.post.upsert({
                where: {
                    companyId_code: {
                        companyId: falconCompany.id,
                        code: postCode,
                    },
                },
                update: {
                    name: name,
                    address: address || location || null,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    companyId: falconCompany.id,
                },
                create: {
                    code: postCode,
                    name: name,
                    address: address || location || null,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    companyId: falconCompany.id,
                },
            });
            console.log(`[Falcon ${postCount}] ${postCode} - ${name} (${coords.lat}, ${coords.lng})`);
        }
    }
    catch (err) {
        console.warn(`Could not read Client List file: ${err.message}`);
    }
    const robiFilePath = path.join(process.cwd(), '(340) BTS DATABASE (Robi new Sims) Information.xls');
    try {
        console.log(`\n--- Seeding BTS Database under Robi ---`);
        const robiWb = xlsx.readFile(robiFilePath);
        const robiSheet = robiWb.Sheets['Main Sheet_31 Jan_2022'] || robiWb.Sheets[robiWb.SheetNames[0]];
        const robiRows = xlsx.utils.sheet_to_json(robiSheet, { range: 2 });
        for (const row of robiRows) {
            const robiCode = row['Robi code'] ? String(row['Robi code']).trim() : null;
            const airtelCode = row['Airtel code'] ? String(row['Airtel code']).trim() : null;
            const district = row['District'] ? String(row['District']).trim() : '';
            const thana = row['Thana'] ? String(row['Thana']).trim() : '';
            const rawAddress = row['  \nAddress'] || row['Address'] || '';
            const address = String(rawAddress).trim().replace(/\n/g, ' ');
            const code = robiCode || airtelCode;
            if (!code || code === 'Robi code')
                continue;
            const postName = `BTS ${code} (${thana || district})`;
            const fullAddress = `${address} ${thana} ${district}`.trim();
            postCount++;
            const postCode = code;
            const coords = await fetchCoordinates(fullAddress, district);
            await prisma.post.upsert({
                where: {
                    companyId_code: {
                        companyId: robiCompany.id,
                        code: postCode,
                    },
                },
                update: {
                    name: postName,
                    address: fullAddress || null,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    companyId: robiCompany.id,
                },
                create: {
                    code: postCode,
                    name: postName,
                    address: fullAddress || null,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    companyId: robiCompany.id,
                },
            });
            console.log(`[Robi ${postCount}] ${postCode} - ${postName} (${coords.lat}, ${coords.lng})`);
        }
    }
    catch (err) {
        console.warn(`Could not read Robi BTS file: ${err.message}`);
    }
    const guardFilePath = path.join(process.cwd(), 'Robi SFA 340 User Format(8) Information New.xlsx');
    try {
        console.log(`\n--- Seeding Guards from Robi SFA 340 ---`);
        const guardWb = xlsx.readFile(guardFilePath);
        const guardSheet = guardWb.Sheets[guardWb.SheetNames[0]];
        const guardRows = xlsx.utils.sheet_to_json(guardSheet);
        let guardCount = 0;
        const defaultGuardPassword = await bcrypt.hash('Password123!', 10);
        for (const row of guardRows) {
            const rawName = row['User Name'];
            const userCode = row['User Code'] ? String(row['User Code']).trim() : null;
            const rawMobile = row['Mobile'] ? String(row['Mobile']).trim() : '';
            const rawDesignation = row['Designation'] ? String(row['Designation']).trim() : 'Security Guard';
            const joiningDateRaw = row['JoiningDate'];
            if (!rawName || !userCode)
                continue;
            const name = String(rawName).trim();
            const phone = rawMobile.replace(/[^0-9+]/g, '');
            const designation = rawDesignation.replace(/\$\$/g, '').trim();
            const joiningDate = parseExcelDate(joiningDateRaw);
            const assignedRole = designation.toLowerCase().includes('manager')
                ? client_1.Role.SECURITY_SUPERVISOR
                : client_1.Role.SECURITY_GUARD;
            const user = await prisma.user.upsert({
                where: { employeeId: userCode },
                update: {
                    name: name,
                    role: assignedRole,
                },
                create: {
                    employeeId: userCode,
                    email: `${userCode.toLowerCase()}@robi.com`,
                    password: defaultGuardPassword,
                    name: name,
                    role: assignedRole,
                },
            });
            await prisma.guardProfile.upsert({
                where: { userId: user.id },
                update: {
                    mobile: phone || null,
                    designation: designation,
                    userRole: row['User Role Name'] ? String(row['User Role Name']).trim() : null,
                    joiningDate: joiningDate,
                    companyId: robiCompany.id,
                },
                create: {
                    userId: user.id,
                    mobile: phone || null,
                    designation: designation,
                    userRole: row['User Role Name'] ? String(row['User Role Name']).trim() : null,
                    joiningDate: joiningDate,
                    companyId: robiCompany.id,
                },
            });
            guardCount++;
            console.log(`[Guard ${guardCount}] ${userCode} - ${name} (${designation})`);
        }
        console.log(`\n✅ Successfully seeded ${guardCount} Robi guards into User and GuardProfile!`);
    }
    catch (err) {
        console.warn(`Could not read Guard List file: ${err.message}`);
    }
    const batbFilePath = path.join(process.cwd(), 'BATB Post Salary Personal List.xls');
    try {
        console.log(`\n--- Seeding BATB Posts, Users, and Guard Profiles ---`);
        const batbWb = xlsx.readFile(batbFilePath);
        const batbSheet = batbWb.Sheets[batbWb.SheetNames[0]];
        const batbRows = xlsx.utils.sheet_to_json(batbSheet);
        let batbGuardCount = 0;
        const defaultBatbPassword = await bcrypt.hash('Password123!', 10);
        for (const row of batbRows) {
            const employeeId = row['ID Number'] ? String(row['ID Number']).trim() : null;
            const rawName = row['Security Personal Name'];
            const rawDesig = row['Desig'] ? String(row['Desig']).trim() : 'Guard';
            const rawPostName = row['Post Name'] ? String(row['Post Name']).trim() : null;
            const rawMobile = row['A/C No'] ? String(row['A/C No']).trim() : '';
            const rawJoiningDate = row['Date of Joynt'];
            if (!employeeId || !rawName || employeeId === 'ID Number')
                continue;
            const name = String(rawName).trim();
            const mobile = rawMobile.replace(/[^0-9+]/g, '');
            const joiningDate = parseExcelDate(rawJoiningDate);
            let post = null;
            if (rawPostName) {
                const postCode = `BATB-${rawPostName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
                const coords = await fetchCoordinates(rawPostName, rawPostName);
                post = await prisma.post.upsert({
                    where: {
                        companyId_code: {
                            companyId: batbCompany.id,
                            code: postCode,
                        },
                    },
                    update: {
                        name: rawPostName,
                        latitude: coords.lat,
                        longitude: coords.lng,
                    },
                    create: {
                        code: postCode,
                        name: rawPostName,
                        companyId: batbCompany.id,
                        latitude: coords.lat,
                        longitude: coords.lng,
                    },
                });
            }
            const assignedRole = mapBatbRole(rawDesig);
            const user = await prisma.user.upsert({
                where: { employeeId: employeeId },
                update: {
                    name: name,
                    role: assignedRole,
                    postId: post?.id ?? null,
                },
                create: {
                    employeeId: employeeId,
                    email: `${employeeId.toLowerCase()}@batb.com`,
                    password: defaultBatbPassword,
                    name: name,
                    role: assignedRole,
                    postId: post?.id ?? null,
                },
            });
            await prisma.guardProfile.upsert({
                where: { userId: user.id },
                update: {
                    mobile: mobile || null,
                    designation: rawDesig,
                    postId: post?.id ?? null,
                    companyId: batbCompany.id,
                    joiningDate: joiningDate,
                },
                create: {
                    userId: user.id,
                    mobile: mobile || null,
                    designation: rawDesig,
                    postId: post?.id ?? null,
                    companyId: batbCompany.id,
                    joiningDate: joiningDate,
                },
            });
            batbGuardCount++;
            console.log(`[BATB ${batbGuardCount}] ${employeeId} - ${name} (${rawDesig}) @ ${rawPostName || 'N/A'}`);
        }
        console.log(`\n✅ Successfully seeded ${batbGuardCount} BATB personnel records!`);
    }
    catch (err) {
        console.warn(`Could not read BATB file: ${err.message}`);
    }
    try {
        const demoGuard = await prisma.user.findUnique({ where: { employeeId: '1001' } });
        const samplePost = await prisma.post.findFirst({ where: { companyId: falconCompany.id } });
        if (demoGuard && samplePost) {
            console.log(`\n--- Creating demo attendance records for ${demoGuard.name} ---`);
            const today = new Date();
            const attendanceData = [];
            for (let i = 1; i <= 20; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                attendanceData.push({
                    userId: demoGuard.id,
                    markedById: demoGuard.id,
                    postId: samplePost.id,
                    date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
                    checkInTime: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0, 0),
                    shiftHours: 8,
                    status: 'PRESENT',
                    captureLatitude: DEFAULT_CENTER.lat,
                    captureLongitude: DEFAULT_CENTER.lng,
                });
            }
            await prisma.attendance.createMany({ data: attendanceData, skipDuplicates: true });
            console.log(`✅ Created ${attendanceData.length} demo attendance records for ${demoGuard.employeeId}`);
        }
        else {
            console.warn('Could not create demo attendances: demo guard or sample post not found.');
        }
    }
    catch (err) {
        console.warn('Error creating demo attendance records:', err.message || err);
    }
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map