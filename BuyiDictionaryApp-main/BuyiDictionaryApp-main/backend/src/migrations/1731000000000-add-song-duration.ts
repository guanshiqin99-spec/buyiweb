import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSongDuration1731000000000 implements MigrationInterface {
  name = 'AddSongDuration1731000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('songs');
    const hasColumn = table?.findColumnByName('duration');
    if (!hasColumn) {
      await queryRunner.query('ALTER TABLE `songs` ADD COLUMN `duration` INT NULL');
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `songs` DROP COLUMN `duration`');
  }
}
