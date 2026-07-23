"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const admin_role_enum_1 = require("../common/enums/admin-role.enum");
const admin_entity_1 = require("../entities/admin.entity");
const app_module_1 = require("../app.module");
function readArg(name) {
    const prefix = `--${name}=`;
    const hit = process.argv.find((item) => item.startsWith(prefix));
    return hit ? hit.slice(prefix.length) : '';
}
async function bootstrap() {
    const username = readArg('username') || process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const password = readArg('password') || process.env.DEFAULT_ADMIN_PASSWORD || '';
    if (!password) {
        throw new Error('请通过 --password= 或 DEFAULT_ADMIN_PASSWORD 提供管理员密码');
    }
    process.env.SEED_ON_BOOT = 'false';
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['error', 'warn'] });
    try {
        const adminRepository = app.get((0, typeorm_1.getRepositoryToken)(admin_entity_1.Admin));
        const existing = await adminRepository.findOne({ where: { username } });
        const passwordHash = await bcrypt.hash(password, 10);
        if (existing) {
            existing.passwordHash = passwordHash;
            existing.role = admin_role_enum_1.AdminRole.SUPER_ADMIN;
            existing.isActive = true;
            await adminRepository.save(existing);
            console.log(`管理员 ${username} 已更新`);
            return;
        }
        await adminRepository.save(adminRepository.create({
            username,
            passwordHash,
            role: admin_role_enum_1.AdminRole.SUPER_ADMIN,
            isActive: true,
        }));
        console.log(`管理员 ${username} 已创建`);
    }
    finally {
        await app.close();
    }
}
void bootstrap();
//# sourceMappingURL=init-admin.js.map