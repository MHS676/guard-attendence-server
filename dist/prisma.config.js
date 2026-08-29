"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@prisma/config");
const dotenv = require("dotenv");
dotenv.config();
exports.default = (0, config_1.defineConfig)({
    migrations: {
        seed: 'npx tsx ./prisma/seed.ts',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
//# sourceMappingURL=prisma.config.js.map