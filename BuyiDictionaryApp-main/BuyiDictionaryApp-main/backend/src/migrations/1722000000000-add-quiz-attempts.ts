import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddQuizAttempts1722000000000 implements MigrationInterface {
  name = 'AddQuizAttempts1722000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('quiz_attempts')) return;
    await queryRunner.createTable(new Table({
      name: 'quiz_attempts',
      columns: [
        { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'userId', type: 'integer' },
        { name: 'score', type: 'integer' },
        { name: 'correctCount', type: 'integer' },
        { name: 'totalQuestions', type: 'integer' },
        { name: 'answersJson', type: 'text' },
        { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await queryRunner.createForeignKey('quiz_attempts', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await queryRunner.createIndex('quiz_attempts', new TableIndex({
      name: 'IDX_quiz_attempt_user_created',
      columnNames: ['userId', 'createdAt'],
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS quiz_attempts');
  }
}
