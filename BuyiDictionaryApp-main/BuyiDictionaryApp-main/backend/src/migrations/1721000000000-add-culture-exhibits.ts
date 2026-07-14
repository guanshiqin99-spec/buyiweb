import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddCultureExhibits1721000000000 implements MigrationInterface {
  name = 'AddCultureExhibits1721000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasTable('culture_exhibits')) {
      await queryRunner.createTable(new Table({
        name: 'culture_exhibits',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'slug', type: 'varchar', length: '96', isUnique: true },
          { name: 'title', type: 'varchar', length: '120' },
          { name: 'kicker', type: 'varchar', length: '120', default: "''" },
          { name: 'summary', type: 'text' },
          { name: 'story', type: 'text', default: "''" },
          { name: 'patternLabel', type: 'varchar', length: '120', default: "''" },
          { name: 'toneIndex', type: 'integer', isNullable: true },
          { name: 'featuredSongId', type: 'integer', isNullable: true },
          { name: 'sourceTitle', type: 'varchar', length: '255', default: "''" },
          { name: 'sourceUrl', type: 'varchar', length: '500', default: "''" },
          { name: 'sourceStatus', type: 'varchar', length: '40', default: "'verified'" },
          { name: 'isPublished', type: 'boolean', default: '1' },
          { name: 'sortOrder', type: 'integer', default: '0' },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }));
    }

    if (!await queryRunner.hasTable('content_culture_links')) {
      await queryRunner.createTable(new Table({
        name: 'content_culture_links',
        columns: [
          { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'contentType', type: 'varchar', length: '32' },
          { name: 'contentId', type: 'integer' },
          { name: 'exhibitId', type: 'integer' },
          { name: 'sortOrder', type: 'integer', default: '0' },
        ],
      }));
      await queryRunner.createForeignKey('content_culture_links', new TableForeignKey({
        columnNames: ['exhibitId'],
        referencedTableName: 'culture_exhibits',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }));
      await queryRunner.createIndex('content_culture_links', new TableIndex({
        name: 'IDX_content_culture_link_unique',
        columnNames: ['contentType', 'contentId', 'exhibitId'],
        isUnique: true,
      }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS content_culture_links');
    await queryRunner.query('DROP TABLE IF EXISTS culture_exhibits');
  }
}
