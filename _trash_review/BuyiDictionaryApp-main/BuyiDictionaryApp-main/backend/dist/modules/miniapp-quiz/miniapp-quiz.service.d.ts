import { Repository } from 'typeorm';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
export declare class MiniappQuizService {
    private readonly quizAttemptsRepository;
    constructor(quizAttemptsRepository: Repository<QuizAttempt>);
    create(userId: number, payload: CreateQuizAttemptDto): Promise<{
        id: number;
        score: number;
        correctCount: number;
        totalQuestions: number;
        answers: Record<string, unknown>[];
        createdAt: Date;
    }>;
    list(userId: number, page: number, pageSize: number): Promise<{
        items: {
            id: number;
            score: number;
            correctCount: number;
            totalQuestions: number;
            answers: Record<string, unknown>[];
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    private serialize;
}
