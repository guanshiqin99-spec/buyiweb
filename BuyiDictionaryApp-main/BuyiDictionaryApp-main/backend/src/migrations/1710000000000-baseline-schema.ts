import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaselineSchema1710000000000 implements MigrationInterface {
  name = 'BaselineSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.synchronize(false);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS learning_records');
    await queryRunner.query('DROP TABLE IF EXISTS favorites');
    await queryRunner.query('DROP TABLE IF EXISTS songs');
    await queryRunner.query('DROP TABLE IF EXISTS proverbs');
    await queryRunner.query('DROP TABLE IF EXISTS phrases');
    await queryRunner.query('DROP TABLE IF EXISTS dictionary_entries');
    await queryRunner.query('DROP TABLE IF EXISTS media_assets');
    await queryRunner.query('DROP TABLE IF EXISTS user_settings');
    await queryRunner.query('DROP TABLE IF EXISTS wechat_accounts');
    await queryRunner.query('DROP TABLE IF EXISTS users');
    await queryRunner.query('DROP TABLE IF EXISTS auth_sessions');
    await queryRunner.query('DROP TABLE IF EXISTS admins');
  }
}
