import { User } from './user.entity';
export declare class QuizAttempt {
    id: number;
    userId: number;
    user: User;
    score: number;
    correctCount: number;
    totalQuestions: number;
    answersJson: string;
    createdAt: Date;
}
