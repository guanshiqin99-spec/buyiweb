import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from '../src/config/database.config';
import { validateEnvironmentOrThrow } from '../src/config/runtime-validation';

describe('production readiness helpers', () => {
  it('rejects insecure production defaults', () => {
    expect(() =>
      validateEnvironmentOrThrow({
        NODE_ENV: 'production',
        JWT_SECRET: 'change-me',
        DB_TYPE: 'sqljs',
        DB_SYNCHRONIZE: 'true',
        WECHAT_MOCK_MODE: 'true',
        SEED_ON_BOOT: 'true',
      } as NodeJS.ProcessEnv),
    ).toThrow();
  });

  it('runs baseline migration on an empty sqljs database', async () => {
    const dataSource = new DataSource(
      buildTypeOrmOptions({
        db: {
          type: 'sqljs',
          host: '127.0.0.1',
          port: 3306,
          username: 'root',
          password: '',
          database: 'migration-test.sqlite',
          synchronize: false,
          logging: false,
        },
      }),
    );

    await dataSource.initialize();
    await dataSource.runMigrations();
    const tables = await dataSource.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('admins', 'users', 'dictionary_entries')",
    );

    expect(tables).toHaveLength(3);
    await dataSource.destroy();
  });
});
