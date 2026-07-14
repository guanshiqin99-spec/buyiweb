import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AdminRole } from '../common/enums/admin-role.enum';
import { Admin } from '../entities/admin.entity';
import { AppModule } from '../app.module';

function readArg(name: string) {
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

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const adminRepository = app.get<Repository<Admin>>(getRepositoryToken(Admin));
    const existing = await adminRepository.findOne({ where: { username } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = AdminRole.SUPER_ADMIN;
      existing.isActive = true;
      await adminRepository.save(existing);
      // eslint-disable-next-line no-console
      console.log(`管理员 ${username} 已更新`);
      return;
    }

    await adminRepository.save(
      adminRepository.create({
        username,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      }),
    );
    // eslint-disable-next-line no-console
    console.log(`管理员 ${username} 已创建`);
  } finally {
    await app.close();
  }
}

void bootstrap();
