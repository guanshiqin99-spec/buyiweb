"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappQuizService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quiz_attempt_entity_1 = require("../../entities/quiz-attempt.entity");
let MiniappQuizService = class MiniappQuizService {
    constructor(quizAttemptsRepository) {
        this.quizAttemptsRepository = quizAttemptsRepository;
    }
    async create(userId, payload) {
        const computedCorrectCount = payload.answers.filter((answer) => answer.correct === true).length;
        if (payload.answers.length !== payload.totalQuestions
            || payload.correctCount !== computedCorrectCount
            || payload.score !== computedCorrectCount * 10) {
            throw new common_1.BadRequestException('答题成绩与答案明细不一致');
        }
        const sanitizedAnswers = payload.answers.map((answer) => ({
            id: String(answer.id || '').slice(0, 96),
            selected: String(answer.selected || '').slice(0, 255),
            answer: String(answer.answer || '').slice(0, 255),
            correct: answer.correct === true,
        }));
        const saved = await this.quizAttemptsRepository.save(this.quizAttemptsRepository.create({
            userId,
            score: payload.score,
            correctCount: payload.correctCount,
            totalQuestions: payload.totalQuestions,
            answersJson: JSON.stringify(sanitizedAnswers),
        }));
        return this.serialize(saved);
    }
    async list(userId, page, pageSize) {
        const [items, total] = await this.quizAttemptsRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return {
            items: items.map((item) => this.serialize(item)),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    }
    serialize(attempt) {
        let answers = [];
        try {
            answers = JSON.parse(attempt.answersJson || '[]');
        }
        catch { }
        return {
            id: attempt.id,
            score: attempt.score,
            correctCount: attempt.correctCount,
            totalQuestions: attempt.totalQuestions,
            answers,
            createdAt: attempt.createdAt,
        };
    }
};
exports.MiniappQuizService = MiniappQuizService;
exports.MiniappQuizService = MiniappQuizService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quiz_attempt_entity_1.QuizAttempt)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MiniappQuizService);
//# sourceMappingURL=miniapp-quiz.service.js.map