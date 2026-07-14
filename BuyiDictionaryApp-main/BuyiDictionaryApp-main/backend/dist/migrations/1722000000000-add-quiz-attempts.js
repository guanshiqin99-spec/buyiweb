"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddQuizAttempts1722000000000 = void 0;
const typeorm_1 = require("typeorm");
class AddQuizAttempts1722000000000 {
    constructor() {
        this.name = 'AddQuizAttempts1722000000000';
    }
    async up(queryRunner) {
        if (await queryRunner.hasTable('quiz_attempts'))
            return;
        await queryRunner.createTable(new typeorm_1.Table({
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
        await queryRunner.createForeignKey('quiz_attempts', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
        await queryRunner.createIndex('quiz_attempts', new typeorm_1.TableIndex({
            name: 'IDX_quiz_attempt_user_created',
            columnNames: ['userId', 'createdAt'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS quiz_attempts');
    }
}
exports.AddQuizAttempts1722000000000 = AddQuizAttempts1722000000000;
//# sourceMappingURL=1722000000000-add-quiz-attempts.js.map