import { ContentType } from '../common/enums/content-type.enum';
import { User } from './user.entity';
export declare class LearningRecord {
    id: number;
    userId: number;
    user: User;
    contentType: ContentType;
    contentId: number;
    actionType: 'view' | 'play';
    createdAt: Date;
}
