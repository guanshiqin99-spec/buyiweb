import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * quiz_attempts 表新增 mode 列:答题模式
 * culture=文化知识答题(默认,兼容旧客户端);pronunciation=发音闯关
 */
export class AddQuizAttemptMode1731000000000 implements MigrationInterface {
  name = 'AddQuizAttemptMode1731000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // 幂等判断:已存在 mode 列则跳过(兼容 synchronize 已自动建列的环境)
    if (await queryRunner.hasColumn('quiz_attempts', 'mode')) return;
    await queryRunner.addColumn('quiz_attempts', new TableColumn({
      name: 'mode',
      type: 'varchar',
      length: '20',
      isNullable: false,
      default: "'culture'",
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // MySQL 直接删除该列;SQLite 老版本(如 sql.js)不支持 DROP COLUMN,此时无法回滚,忽略即可
    if (!(await queryRunner.hasColumn('quiz_attempts', 'mode'))) return;
    try {
      await queryRunner.dropColumn('quiz_attempts', 'mode');
    } catch (error) {
      // SQLite 老版本不支持 ALTER TABLE DROP COLUMN,忽略该错误
      console.warn('回滚删除 quiz_attempts.mode 列失败(可能是 SQLite 老版本不支持 DROP COLUMN):', error);
    }
  }
}
