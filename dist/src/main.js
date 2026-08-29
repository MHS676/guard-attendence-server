"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableCors();
    const port = process.env.PORT || 5000;
    await app.listen(port, '0.0.0.0');
    console.log(`Application running on http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map