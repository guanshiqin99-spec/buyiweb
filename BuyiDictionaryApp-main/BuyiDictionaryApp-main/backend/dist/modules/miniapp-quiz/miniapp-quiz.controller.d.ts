import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { MiniappQuizService } from './miniapp-quiz.service';
export declare class MiniappQuizController {
    private readonly quizService;
    constructor(quizService: MiniappQuizService);
    create(user: {
        sub: number;
    }, payload: CreateQuizAttemptDto): Promise<{
        id: number;
        score: number;
        correctCount: number;
        totalQuestions: number;
        answers: Record<string, unknown>[];
        createdAt: Date;
    }>;
    list(user: {
        sub: number;
    }, query: PaginationQueryDto): Promise<{
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
}
